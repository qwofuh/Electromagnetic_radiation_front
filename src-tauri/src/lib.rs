use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .setup(|app| {
      #[cfg(debug_assertions)]
      {
        // Используем eval для открытия devtools
        let window = app.get_webview_window("main").unwrap();
        let _ = window.eval("window.__TAURI__.window.getCurrentWindow().openDevTools()");
      }
      
      // Для отладки билда временно включаем eval
      let window = app.get_webview_window("main").unwrap();
      let _ = window.eval("window.__TAURI__.window.getCurrentWindow().openDevTools()");
      
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
