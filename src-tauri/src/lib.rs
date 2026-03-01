use tauri::Manager;

mod commands;
mod db;
mod error;

pub use error::{AppError, AppResult};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            let app_dir = app
                .path()
                .app_data_dir()
                .expect("failed to resolve app data dir");
            std::fs::create_dir_all(&app_dir)?;

            let db_path = app_dir.join("life-copilot.db");
            db::init(db_path)?;

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![commands::greet,])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
