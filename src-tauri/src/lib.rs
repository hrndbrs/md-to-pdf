#![allow(unexpected_cfgs)] // objc 0.2 macros emit cfg(cargo-clippy) internally

use std::sync::{Arc, Mutex};
use std::time::Duration;
use tauri::{AppHandle, WebviewUrl, WebviewWindowBuilder};

// ---------------------------------------------------------------------------
// Shared types
// ---------------------------------------------------------------------------

struct HeadingInfo {
    text: String,
    y: f64,
}

const HEADINGS_JS: &str = r#"(function(){
    function top(el){var t=0,c=el;while(c&&c!==document.body){t+=c.offsetTop;c=c.offsetParent;}return t;}
    return JSON.stringify(Array.from(document.querySelectorAll('h1,h2,h3,h4')).map(function(h){
        return {text:h.textContent.trim().slice(0,200),level:parseInt(h.tagName[1]),y:top(h)};
    }));
})()"#;

fn parse_headings(json: &str) -> Vec<HeadingInfo> {
    serde_json::from_str::<Vec<serde_json::Value>>(json)
        .unwrap_or_default()
        .into_iter()
        .filter_map(|v| {
            Some(HeadingInfo {
                text: v.get("text")?.as_str()?.to_owned(),
                y: v.get("y")?.as_f64()?,
            })
        })
        .collect()
}

// ---------------------------------------------------------------------------
// Commands
// ---------------------------------------------------------------------------

#[tauri::command]
fn reveal_in_finder(path: String) {
    #[cfg(target_os = "macos")]
    let _ = std::process::Command::new("open")
        .args(["-R", &path])
        .spawn();

    #[cfg(target_os = "windows")]
    let _ = std::process::Command::new("explorer")
        .arg(format!("/select,{}", path))
        .spawn();

    #[cfg(target_os = "linux")]
    let _ = std::process::Command::new("xdg-open")
        .arg(
            std::path::Path::new(&path)
                .parent()
                .unwrap_or(std::path::Path::new(".")),
        )
        .spawn();
}

#[tauri::command]
async fn export_pdf_native(
    app: AppHandle,
    html: String,
    output_path: String,
    page_width_px: f64,
    page_height_px: f64,
) -> Result<(), String> {
    // ── Write HTML to a temp file and get a file:// URL ──────────────────────
    let ts = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_default()
        .as_millis();
    let temp_html = std::env::temp_dir().join(format!("md_to_pdf_{}.html", ts));
    std::fs::write(&temp_html, &html).map_err(|e| e.to_string())?;

    let file_url_str = {
        #[cfg(target_os = "windows")]
        {
            format!(
                "file:///{}",
                temp_html
                    .to_str()
                    .ok_or("bad temp path")?
                    .replace('\\', "/")
            )
        }
        #[cfg(not(target_os = "windows"))]
        {
            format!("file://{}", temp_html.to_str().ok_or("bad temp path")?)
        }
    };

    let file_url: url::Url =
        file_url_str.parse().map_err(|_| "Could not parse temp file URL".to_string())?;

    // ── Create a hidden offscreen WebView window ─────────────────────────────
    let (load_tx, load_rx) = std::sync::mpsc::channel::<()>();
    let load_tx = Arc::new(Mutex::new(Some(load_tx)));
    let load_tx2 = Arc::clone(&load_tx);

    let win =
        WebviewWindowBuilder::new(&app, "pdf-export-hidden", WebviewUrl::External(file_url))
            .on_page_load(move |_win, payload| {
                use tauri::webview::PageLoadEvent;
                if payload.event() == PageLoadEvent::Finished {
                    if let Some(tx) = load_tx2.lock().unwrap().take() {
                        let _ = tx.send(());
                    }
                }
            })
            .inner_size(page_width_px, 8000.0)
            .position(-32000.0, -32000.0)
            .visible(true)
            .decorations(false)
            .shadow(false)
            .build()
            .map_err(|e| e.to_string())?;

    load_rx
        .recv_timeout(Duration::from_secs(30))
        .map_err(|_| "Timed out waiting for page load".to_string())?;

    let _ = std::fs::remove_file(&temp_html);
    std::thread::sleep(Duration::from_millis(800));

    // ── Platform-specific capture ────────────────────────────────────────────
    let (result_tx, result_rx) =
        std::sync::mpsc::channel::<Result<Vec<HeadingInfo>, String>>();
    let out = output_path.clone();

    win.with_webview(move |wv| {
        #[cfg(target_os = "macos")]
        let r = unsafe { macos::capture(wv.inner(), &out, page_width_px, page_height_px) };

        #[cfg(target_os = "windows")]
        let r = win_pdf::capture(wv.controller(), wv.environment(), &out, page_width_px, page_height_px);

        #[cfg(target_os = "linux")]
        let r = linux::capture(&wv.inner(), &out, page_width_px, page_height_px);

        #[cfg(not(any(target_os = "macos", target_os = "windows", target_os = "linux")))]
        let r: Result<Vec<HeadingInfo>, String> = Err("Unsupported platform".into());

        let _ = result_tx.send(r);
    })
    .map_err(|e| e.to_string())?;

    let headings = result_rx
        .recv_timeout(Duration::from_secs(120))
        .map_err(|_| "PDF capture timed out".to_string())??;

    let _ = win.close();

    // ── Add PDF bookmarks (pure Rust, all platforms) ─────────────────────────
    if !headings.is_empty() {
        if let Err(e) = add_bookmarks_lopdf(&output_path, &headings, page_height_px) {
            eprintln!("lopdf bookmark warning: {e}");
        }
    }

    Ok(())
}

// ---------------------------------------------------------------------------
// macOS — WKWebView + PDFKit page assembly
// ---------------------------------------------------------------------------

#[cfg(target_os = "macos")]
mod macos {
    use super::{parse_headings, HeadingInfo, HEADINGS_JS};
    use block::ConcreteBlock;
    use objc::{class, msg_send, runtime::Object, sel, sel_impl};
    use std::sync::{Arc, Mutex};

    pub unsafe fn capture(
        webview_ptr: *mut std::ffi::c_void,
        output_path: &str,
        page_width: f64,
        page_height: f64,
    ) -> Result<Vec<HeadingInfo>, String> {
        // Force-load PDFKit so its ObjC classes register
        let kit_path = ns_str("/System/Library/Frameworks/PDFKit.framework");
        let kit_bundle: *mut Object = msg_send![class!(NSBundle), bundleWithPath: kit_path];
        if !kit_bundle.is_null() {
            let _: bool = msg_send![kit_bundle, load];
        }
        let pdf_doc_cls = class!(PDFDocument);

        let wv = webview_ptr as *mut Object;
        let runloop: *mut Object = msg_send![class!(NSRunLoop), currentRunLoop];

        macro_rules! pump {
            ($n:expr) => {
                for _ in 0..$n {
                    let d: *mut Object =
                        msg_send![class!(NSDate), dateWithTimeIntervalSinceNow: 0.05f64];
                    let _: () = msg_send![runloop, runUntilDate: d];
                }
            };
        }

        macro_rules! eval_js {
            ($js:expr => $ty:ty, |$r:ident| $extract:expr) => {{
                let (tx, rx) = std::sync::mpsc::channel::<$ty>();
                let tx = Arc::new(Mutex::new(Some(tx)));
                let blk = ConcreteBlock::new({
                    let tx = Arc::clone(&tx);
                    move |$r: *mut Object, _err: *mut Object| {
                        let val: $ty = $extract;
                        if let Some(s) = tx.lock().unwrap().take() {
                            let _ = s.send(val);
                        }
                    }
                });
                let blk = blk.copy();
                let js_ns = ns_str($js);
                let _: () = msg_send![wv, evaluateJavaScript: js_ns completionHandler: &*blk];
                loop {
                    pump!(1);
                    match rx.try_recv() {
                        Ok(v) => break v,
                        Err(std::sync::mpsc::TryRecvError::Empty) => continue,
                        Err(_) => break Default::default(),
                    }
                }
            }};
        }

        // Get content height
        let doc_height: f64 = eval_js!(
            "document.documentElement.scrollHeight" => f64,
            |r| if r.is_null() { 8000.0 } else { msg_send![r, doubleValue] }
        );

        // Resize window to full content height
        let nswin: *mut Object = msg_send![wv, window];
        let _: () = msg_send![nswin, setContentSize: NSSize { width: page_width, height: doc_height }];
        pump!(10);

        // Collect headings
        let headings_json: String = eval_js!(HEADINGS_JS => String, |r| {
            if r.is_null() {
                String::new()
            } else {
                let c: *const std::os::raw::c_char = msg_send![r, UTF8String];
                if c.is_null() { String::new() }
                else { std::ffi::CStr::from_ptr(c).to_string_lossy().into_owned() }
            }
        });
        let headings = parse_headings(&headings_json);

        // Per-page createPDF
        let page_count = (doc_height / page_height).ceil() as usize;
        let mut page_data_list: Vec<Vec<u8>> = Vec::with_capacity(page_count);

        for page_idx in 0..page_count {
            let page_rect = CGRect {
                origin: CGPoint { x: 0.0, y: page_idx as f64 * page_height },
                size: CGSize { width: page_width, height: page_height },
            };
            let cfg: *mut Object = msg_send![class!(WKPDFConfiguration), new];
            let _: () = msg_send![cfg, setRect: page_rect];

            let (ptx, prx) = std::sync::mpsc::channel::<Result<Vec<u8>, String>>();
            let ptx = Arc::new(Mutex::new(Some(ptx)));
            let pdf_blk = ConcreteBlock::new(move |data: *mut Object, error: *mut Object| {
                let res: Result<Vec<u8>, String> = if !error.is_null() {
                    let desc: *mut Object = msg_send![error, localizedDescription];
                    let c: *const std::os::raw::c_char = msg_send![desc, UTF8String];
                    Err(std::ffi::CStr::from_ptr(c).to_string_lossy().into_owned())
                } else if data.is_null() {
                    Err("nil data".into())
                } else {
                    let bytes: *const u8 = msg_send![data, bytes];
                    let len: usize = msg_send![data, length];
                    Ok(std::slice::from_raw_parts(bytes, len).to_vec())
                };
                if let Some(s) = ptx.lock().unwrap().take() {
                    let _ = s.send(res);
                }
            });
            let pdf_blk = pdf_blk.copy();
            let _: () = msg_send![wv, createPDFWithConfiguration: cfg completionHandler: &*pdf_blk];

            let bytes = loop {
                pump!(1);
                match prx.try_recv() {
                    Ok(r) => break r,
                    Err(std::sync::mpsc::TryRecvError::Empty) => continue,
                    Err(_) => break Err("disconnected".into()),
                }
            };
            match bytes {
                Ok(b) if !b.is_empty() => page_data_list.push(b),
                Ok(_) => {}
                Err(e) => eprintln!("page {page_idx} createPDF error: {e}"),
            }
        }

        // Assemble with PDFKit
        let combined: *mut Object = msg_send![pdf_doc_cls, new];
        if combined.is_null() {
            return Err("PDFDocument alloc failed".into());
        }
        for bytes in &page_data_list {
            let ns_data: *mut Object = msg_send![
                class!(NSData),
                dataWithBytes: bytes.as_ptr() length: bytes.len()
            ];
            let pd: *mut Object = msg_send![pdf_doc_cls, alloc];
            let pd: *mut Object = msg_send![pd, initWithData: ns_data];
            if pd.is_null() {
                continue;
            }
            let pp: *mut Object = msg_send![pd, pageAtIndex: 0usize];
            if pp.is_null() {
                continue;
            }
            let cnt: usize = msg_send![combined, pageCount];
            let _: () = msg_send![combined, insertPage: pp atIndex: cnt];
        }

        let url_ns = ns_str(output_path);
        let url_obj: *mut Object = msg_send![class!(NSURL), fileURLWithPath: url_ns];
        let ok: bool = msg_send![combined, writeToURL: url_obj];
        if !ok {
            return Err("PDFDocument.writeToURL failed".into());
        }

        Ok(headings)
    }

    #[repr(C)]
    #[derive(Clone, Copy)]
    pub struct CGPoint {
        pub x: f64,
        pub y: f64,
    }
    #[repr(C)]
    #[derive(Clone, Copy)]
    pub struct CGSize {
        pub width: f64,
        pub height: f64,
    }
    #[repr(C)]
    #[derive(Clone, Copy)]
    pub struct CGRect {
        pub origin: CGPoint,
        pub size: CGSize,
    }
    #[repr(C)]
    #[derive(Clone, Copy)]
    pub struct NSSize {
        pub width: f64,
        pub height: f64,
    }

    pub unsafe fn ns_str(s: &str) -> *mut Object {
        let cstr = std::ffi::CString::new(s).unwrap_or_default();
        msg_send![class!(NSString), stringWithUTF8String: cstr.as_ptr()]
    }
}

// ---------------------------------------------------------------------------
// Windows — WebView2 ExecuteScript + PrintToPdf
// ---------------------------------------------------------------------------

#[cfg(target_os = "windows")]
mod win_pdf {
    use super::{parse_headings, HeadingInfo, HEADINGS_JS};
    use std::sync::{Arc, Mutex};
    use webview2_com::{
        callback::{CompletedClosure, ExecuteScriptCompletedHandler, PrintToPdfCompletedHandler},
        Microsoft::Web::WebView2::Win32::*,
    };
    use windows::{
        core::Interface,
        Win32::{
            Foundation::HANDLE,
            System::{
                Com::CoWaitForMultipleHandles,
                Threading::{CreateEventW, SetEvent},
            },
        },
    };

    // COWAIT_DISPATCH_CALLS | COWAIT_DISPATCH_WINDOW_MESSAGES
    const COWAIT_FLAGS: u32 = 8 | 16;

    pub fn capture(
        controller: ICoreWebView2Controller,
        environment: ICoreWebView2Environment,
        output_path: &str,
        page_width_px: f64,
        page_height_px: f64,
    ) -> Result<Vec<HeadingInfo>, String> {
        let core_wv: ICoreWebView2 = unsafe { controller.CoreWebView2() }
            .map_err(|e| e.to_string())?;
        let wv7: ICoreWebView2_7 = core_wv.cast().map_err(|e| e.to_string())?;

        // Pump COM STA until event fires
        let wait = |h: HANDLE| -> Result<(), String> {
            unsafe { CoWaitForMultipleHandles(COWAIT_FLAGS, 60_000, &[h]) }
                .map(|_| ())
                .map_err(|e| e.to_string())
        };

        // Evaluate JS synchronously
        let eval_js = |js: &str| -> Result<String, String> {
            let js_wide: Vec<u16> = js.encode_utf16().chain(Some(0)).collect();
            let result = Arc::new(Mutex::new(String::new()));
            let result2 = Arc::clone(&result);

            let event = unsafe { CreateEventW(None, true, false, None) }
                .map_err(|e| e.to_string())?;
            let event2 = event;

            let handler = ExecuteScriptCompletedHandler::create(Box::new(
                move |_err: windows::core::Result<()>, json: String| {
                    *result2.lock().unwrap() = json;
                    unsafe { SetEvent(event2) }.ok();
                    Ok(())
                },
            ) as CompletedClosure<_, _>);

            unsafe {
                core_wv
                    .ExecuteScript(windows::core::PCWSTR(js_wide.as_ptr()), &handler)
                    .map_err(|e| e.to_string())?;
            }
            wait(event)?;

            let raw = result.lock().unwrap().clone();
            // ExecuteScript returns JSON-encoded result; unwrap outer string quotes
            Ok(serde_json::from_str::<String>(&raw).unwrap_or(raw))
        };

        // Collect headings
        let headings_json = eval_js(HEADINGS_JS)?;
        let headings = parse_headings(&headings_json);

        // Configure print settings (px → inches at 96 dpi)
        let width_in = page_width_px / 96.0;
        let height_in = page_height_px / 96.0;

        let env6: ICoreWebView2Environment6 = environment.cast().map_err(|e| e.to_string())?;
        let print_settings: ICoreWebView2PrintSettings =
            unsafe { env6.CreatePrintSettings() }.map_err(|e| e.to_string())?;

        unsafe {
            print_settings.SetPageWidth(width_in).ok();
            print_settings.SetPageHeight(height_in).ok();
            print_settings.SetMarginTop(0.0).ok();
            print_settings.SetMarginBottom(0.0).ok();
            print_settings.SetMarginLeft(0.0).ok();
            print_settings.SetMarginRight(0.0).ok();
            print_settings.SetShouldPrintHeaderAndFooter(false).ok();
            print_settings.SetShouldPrintBackgrounds(true).ok();
        }

        // Print to PDF
        let out_wide: Vec<u16> = output_path.encode_utf16().chain(Some(0)).collect();
        let success = Arc::new(Mutex::new(false));
        let success2 = Arc::clone(&success);

        let event = unsafe { CreateEventW(None, true, false, None) }
            .map_err(|e| e.to_string())?;
        let event2 = event;

        let print_handler = PrintToPdfCompletedHandler::create(Box::new(
            move |_err: windows::core::Result<()>, is_successful: bool| {
                *success2.lock().unwrap() = is_successful;
                unsafe { SetEvent(event2) }.ok();
                Ok(())
            },
        ) as CompletedClosure<_, _>);

        unsafe {
            wv7.PrintToPdf(
                windows::core::PCWSTR(out_wide.as_ptr()),
                &print_settings,
                &print_handler,
            )
            .map_err(|e| e.to_string())?;
        }
        wait(event)?;

        if !*success.lock().unwrap() {
            return Err("WebView2 PrintToPdf failed".into());
        }

        Ok(headings)
    }
}

// ---------------------------------------------------------------------------
// Linux — WebKitGTK PrintOperation
// ---------------------------------------------------------------------------

#[cfg(target_os = "linux")]
mod linux {
    use super::{parse_headings, HeadingInfo, HEADINGS_JS};
    use glib::MainContext;
    use gtk::{PageSetup, PaperSize, PrintSettings, Unit};
    use std::sync::{Arc, Mutex};
    use webkit2gtk::{PrintOperation, PrintOperationExt, WebView, WebViewExt as _};

    pub fn capture(
        web_view: &WebView,
        output_path: &str,
        page_width_px: f64,
        page_height_px: f64,
    ) -> Result<Vec<HeadingInfo>, String> {
        let ctx = MainContext::default();

        // Evaluate JS synchronously via GLib main loop pump
        let eval_js = |js: &str| -> Result<String, String> {
            let result: Arc<Mutex<Option<Result<String, String>>>> =
                Arc::new(Mutex::new(None));
            let result2 = Arc::clone(&result);

            // evaluate_javascript(script, world_name, source_uri, cancellable, callback)
            // callback receives Result<java_script_core::Value, glib::Error>
            // Value implements Display so .to_string() works
            web_view.evaluate_javascript(
                js,
                None,  // world_name
                None,  // source_uri
                None::<&gio::Cancellable>,
                move |res| {
                    let val = res.map_err(|e| e.to_string()).map(|v| v.to_string());
                    *result2.lock().unwrap() = Some(val);
                },
            );

            let deadline =
                std::time::Instant::now() + std::time::Duration::from_secs(30);
            loop {
                if let Some(v) = result.lock().unwrap().take() {
                    return v;
                }
                if std::time::Instant::now() > deadline {
                    return Err("JS eval timeout".into());
                }
                ctx.iteration(false);
                std::thread::sleep(std::time::Duration::from_millis(20));
            }
        };

        // Collect headings
        let headings_json = eval_js(HEADINGS_JS)?;
        let headings = parse_headings(&headings_json);

        // Page dimensions: px → mm (1 inch = 96px = 25.4mm)
        let width_mm = page_width_px * 25.4 / 96.0;
        let height_mm = page_height_px * 25.4 / 96.0;

        let paper = PaperSize::new_custom("custom", "custom", width_mm, height_mm, Unit::Mm);
        let page_setup = PageSetup::new();
        page_setup.set_paper_size(&paper);
        page_setup.set_top_margin(0.0, Unit::Mm);
        page_setup.set_bottom_margin(0.0, Unit::Mm);
        page_setup.set_left_margin(0.0, Unit::Mm);
        page_setup.set_right_margin(0.0, Unit::Mm);

        let settings = PrintSettings::new();
        settings.set("output-file-format", Some("pdf"));
        settings.set("output-uri", Some(format!("file://{output_path}").as_str()));

        let print_op = PrintOperation::new(web_view);
        print_op.set_print_settings(&settings);
        print_op.set_page_setup(&page_setup);

        let done: Arc<Mutex<bool>> = Arc::new(Mutex::new(false));
        let done2 = Arc::clone(&done);
        print_op.connect_finished(move |_| {
            *done2.lock().unwrap() = true;
        });

        print_op.print();

        let deadline = std::time::Instant::now() + std::time::Duration::from_secs(60);
        loop {
            if *done.lock().unwrap() {
                break;
            }
            if std::time::Instant::now() > deadline {
                return Err("PDF print timed out".into());
            }
            ctx.iteration(false);
            std::thread::sleep(std::time::Duration::from_millis(50));
        }

        Ok(headings)
    }
}

// ---------------------------------------------------------------------------
// Bookmarks — pure Rust, all platforms
// ---------------------------------------------------------------------------

fn add_bookmarks_lopdf(
    path: &str,
    headings: &[HeadingInfo],
    page_height_px: f64,
) -> Result<(), String> {
    let mut doc = lopdf::Document::load(path).map_err(|e| e.to_string())?;

    let pages = doc.get_pages();
    let page_count = pages.len();
    if page_count == 0 {
        return Ok(());
    }

    let first_page_id = *pages.get(&1).ok_or("no page 1")?;
    let page_height_pts: f64 = doc
        .objects
        .get(&first_page_id)
        .and_then(|o| o.as_dict().ok())
        .and_then(|d| d.get(b"MediaBox").ok())
        .and_then(|o| o.as_array().ok())
        .and_then(|a| a.get(3))
        .map(|v| match v {
            lopdf::Object::Real(r) => *r as f64,
            lopdf::Object::Integer(i) => *i as f64,
            _ => page_height_px,
        })
        .unwrap_or(page_height_px);

    let scale = page_height_pts / page_height_px;

    let mut item_ids: Vec<lopdf::ObjectId> = Vec::new();
    for h in headings {
        let page_num = (h.y / page_height_px).floor() as u32 + 1;
        if page_num as usize > page_count {
            continue;
        }
        let &page_id = match pages.get(&page_num) {
            Some(id) => id,
            None => continue,
        };

        let y_on_page = h.y - (page_num as f64 - 1.0) * page_height_px;
        let pdf_y = (page_height_pts - y_on_page * scale).max(0.0);

        let mut item = lopdf::Dictionary::new();
        item.set(
            b"Title",
            lopdf::Object::String(
                h.text.as_bytes().to_vec(),
                lopdf::StringFormat::Literal,
            ),
        );
        item.set(
            b"Dest",
            lopdf::Object::Array(vec![
                lopdf::Object::Reference(page_id),
                lopdf::Object::Name(b"XYZ".to_vec()),
                lopdf::Object::Null,
                lopdf::Object::Real(pdf_y as f32),
                lopdf::Object::Null,
            ]),
        );
        item_ids.push(doc.add_object(lopdf::Object::Dictionary(item)));
    }

    if item_ids.is_empty() {
        return Ok(());
    }

    let root_id = doc.add_object(lopdf::Object::Dictionary(lopdf::Dictionary::new()));

    for (i, &id) in item_ids.iter().enumerate() {
        if let Some(lopdf::Object::Dictionary(ref mut d)) = doc.objects.get_mut(&id) {
            d.set(b"Parent", lopdf::Object::Reference(root_id));
            if i > 0 {
                d.set(b"Prev", lopdf::Object::Reference(item_ids[i - 1]));
            }
            if i + 1 < item_ids.len() {
                d.set(b"Next", lopdf::Object::Reference(item_ids[i + 1]));
            }
        }
    }

    let mut root_dict = lopdf::Dictionary::new();
    root_dict.set(b"Type", lopdf::Object::Name(b"Outlines".to_vec()));
    root_dict.set(b"Count", lopdf::Object::Integer(item_ids.len() as i64));
    root_dict.set(b"First", lopdf::Object::Reference(*item_ids.first().unwrap()));
    root_dict.set(b"Last", lopdf::Object::Reference(*item_ids.last().unwrap()));
    if let Some(obj) = doc.objects.get_mut(&root_id) {
        *obj = lopdf::Object::Dictionary(root_dict);
    }

    let catalog_id = doc
        .trailer
        .get(b"Root")
        .map_err(|_| "no Root in trailer")?
        .as_reference()
        .map_err(|_| "Root not a reference")?;
    if let Some(lopdf::Object::Dictionary(ref mut d)) = doc.objects.get_mut(&catalog_id) {
        d.set(b"Outlines", lopdf::Object::Reference(root_id));
        d.set(b"PageMode", lopdf::Object::Name(b"UseOutlines".to_vec()));
    }

    doc.save(path).map_err(|e| e.to_string())?;
    Ok(())
}

// ---------------------------------------------------------------------------
// App entry
// ---------------------------------------------------------------------------

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .invoke_handler(tauri::generate_handler![reveal_in_finder, export_pdf_native])
        .run(tauri::generate_context!())
        .expect("error while running tauri application")
}
