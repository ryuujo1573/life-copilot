use rusqlite::OptionalExtension;

use crate::{db, AppResult};

/// Retrieve a stored plugin value by key.
///
/// Returns the raw JSON string, or `None` if the key does not exist.
/// The frontend is responsible for `JSON.parse`-ing the result.
#[tauri::command]
pub fn plugin_storage_get(plugin_id: &str, key: &str) -> AppResult<Option<String>> {
    db::with_conn(|conn| {
        let value = conn
            .query_row(
                "SELECT value FROM plugin_storage WHERE plugin_id = ?1 AND key = ?2",
                rusqlite::params![plugin_id, key],
                |row| row.get::<_, String>(0),
            )
            .optional()?;
        Ok(value)
    })
}

/// Upsert a plugin value.
///
/// `value` must be a JSON-serialised string (produced by `JSON.stringify` on
/// the frontend). Creates the row if absent, updates it if present, and
/// refreshes `updated_at` in both cases.
#[tauri::command]
pub fn plugin_storage_set(plugin_id: &str, key: &str, value: &str) -> AppResult<()> {
    db::with_conn(|conn| {
        conn.execute(
            "INSERT INTO plugin_storage (plugin_id, key, value, updated_at)
             VALUES (?1, ?2, ?3, datetime('now'))
             ON CONFLICT (plugin_id, key)
             DO UPDATE SET value = excluded.value,
                           updated_at = excluded.updated_at",
            rusqlite::params![plugin_id, key, value],
        )?;
        Ok(())
    })
}

/// Delete a plugin value.
///
/// Silently succeeds (returns `Ok(())`) if the key does not exist.
#[tauri::command]
pub fn plugin_storage_delete(plugin_id: &str, key: &str) -> AppResult<()> {
    db::with_conn(|conn| {
        conn.execute(
            "DELETE FROM plugin_storage WHERE plugin_id = ?1 AND key = ?2",
            rusqlite::params![plugin_id, key],
        )?;
        Ok(())
    })
}
