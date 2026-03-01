use serde::Deserialize;

use crate::{db, AppResult};

#[derive(Debug, Deserialize)]
pub struct SaveSessionPayload {
    pub id: String,
    pub task_id: Option<String>,
    pub planned_minutes: i32,
    pub actual_minutes: i32,
    pub interrupted: bool,
    pub notes: Option<String>,
}

/// Persist a completed (or aborted) focus session.
#[tauri::command]
pub fn focus_session_save(payload: SaveSessionPayload) -> AppResult<()> {
    db::with_conn(|conn| {
        conn.execute(
            "INSERT INTO focus_sessions
                (id, task_id, planned_minutes, actual_minutes, interrupted, notes, ended_at)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, datetime('now'))
             ON CONFLICT (id) DO UPDATE SET
                ended_at        = excluded.ended_at,
                actual_minutes  = excluded.actual_minutes,
                interrupted     = excluded.interrupted,
                notes           = excluded.notes",
            rusqlite::params![
                payload.id,
                payload.task_id,
                payload.planned_minutes,
                payload.actual_minutes,
                payload.interrupted as i32,
                payload.notes,
            ],
        )?;
        Ok(())
    })
}
