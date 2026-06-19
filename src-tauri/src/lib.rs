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

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .invoke_handler(tauri::generate_handler![reveal_in_finder])
        .run(tauri::generate_context!())
        .expect("error while running tauri application")
}
