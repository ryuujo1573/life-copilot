use crate::AppResult;

pub mod focus_session;
pub mod plugin_storage;
pub mod routines;
pub mod tasks;

/// Greet command — used to smoke-test IPC during development.
#[tauri::command]
pub fn greet(name: &str) -> AppResult<String> {
    Ok(format!("Hello, {name}! Life Copilot is alive."))
}
