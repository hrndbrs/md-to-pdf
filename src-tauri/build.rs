fn main() {
    tauri_build::build();

    #[cfg(target_os = "macos")]
    {
        println!("cargo:rustc-link-lib=framework=CoreGraphics");
        println!("cargo:rustc-link-lib=framework=CoreFoundation");
        println!("cargo:rustc-link-lib=framework=PDFKit");
    }
}
