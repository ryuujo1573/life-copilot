use crate::AppResult;

pub mod plugin_storage;

/// Greet command — used to smoke-test IPC during development.
#[tauri::command]
pub fn greet(name: &str) -> AppResult<String> {
    Ok(format!("Hello, {name}! Life Copilot is alive."))
}
