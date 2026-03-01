use serde::{Deserialize, Serialize};

use crate::{db, AppResult};

// ── Types ────────────────────────────────────────────────────────────────────

#[derive(Debug, Serialize, Deserialize)]
pub struct Task {
    pub id: String,
    pub title: String,
    pub notes: Option<String>,
    pub list_id: Option<String>,
    pub due_at: Option<String>,
    pub is_done: bool,
    pub done_at: Option<String>,
    pub priority: i32,
    pub sort_order: i32,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Deserialize)]
pub struct CreateTaskPayload {
    pub id: String,
    pub title: String,
    pub notes: Option<String>,
    pub list_id: Option<String>,
    pub due_at: Option<String>,
    pub priority: Option<i32>,
}

// ── Commands ─────────────────────────────────────────────────────────────────

/// Create a new task.
#[tauri::command]
pub fn task_create(payload: CreateTaskPayload) -> AppResult<Task> {
    db::with_conn(|conn| {
        let priority = payload.priority.unwrap_or(0);
        conn.execute(
            "INSERT INTO tasks (id, title, notes, list_id, due_at, priority)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
            rusqlite::params![
                payload.id,
                payload.title,
                payload.notes,
                payload.list_id,
                payload.due_at,
                priority,
            ],
        )?;

        let task = conn.query_row(
            "SELECT id, title, notes, list_id, due_at, is_done, done_at,
                    priority, sort_order, created_at, updated_at
             FROM tasks WHERE id = ?1",
            rusqlite::params![payload.id],
            map_task_row,
        )?;
        Ok(task)
    })
}

/// List tasks, optionally filtered by list_id.
/// Pass `list_id = null` to list the inbox (tasks with no list).
#[tauri::command]
pub fn task_list(list_id: Option<String>) -> AppResult<Vec<Task>> {
    db::with_conn(|conn| {
        let tasks = match &list_id {
            Some(id) => {
                let mut stmt = conn.prepare(
                    "SELECT id, title, notes, list_id, due_at, is_done, done_at,
                            priority, sort_order, created_at, updated_at
                     FROM tasks
                     WHERE list_id = ?1 AND deleted_at IS NULL
                     ORDER BY sort_order, created_at",
                )?;
                let rows = stmt
                    .query_map(rusqlite::params![id], map_task_row)?
                    .collect::<Result<Vec<_>, _>>()?;
                rows
            }
            None => {
                let mut stmt = conn.prepare(
                    "SELECT id, title, notes, list_id, due_at, is_done, done_at,
                            priority, sort_order, created_at, updated_at
                     FROM tasks
                     WHERE list_id IS NULL AND deleted_at IS NULL
                     ORDER BY sort_order, created_at",
                )?;
                let rows = stmt
                    .query_map([], map_task_row)?
                    .collect::<Result<Vec<_>, _>>()?;
                rows
            }
        };
        Ok(tasks)
    })
}

/// Mark a task as done (or un-done).
#[tauri::command]
pub fn task_complete(id: String, done: bool) -> AppResult<()> {
    db::with_conn(|conn| {
        let done_at: Option<&str> = if done { Some("datetime('now')") } else { None };
        if done {
            conn.execute(
                "UPDATE tasks SET is_done = 1, done_at = datetime('now'),
                 updated_at = datetime('now')
                 WHERE id = ?1",
                rusqlite::params![id],
            )?;
        } else {
            conn.execute(
                "UPDATE tasks SET is_done = 0, done_at = NULL,
                 updated_at = datetime('now')
                 WHERE id = ?1",
                rusqlite::params![id],
            )?;
        }
        let _ = done_at;
        Ok(())
    })
}

/// Soft-delete a task.
#[tauri::command]
pub fn task_delete(id: String) -> AppResult<()> {
    db::with_conn(|conn| {
        conn.execute(
            "UPDATE tasks SET deleted_at = datetime('now'), updated_at = datetime('now')
             WHERE id = ?1",
            rusqlite::params![id],
        )?;
        Ok(())
    })
}

// ── Helpers ──────────────────────────────────────────────────────────────────

fn map_task_row(row: &rusqlite::Row<'_>) -> rusqlite::Result<Task> {
    Ok(Task {
        id: row.get(0)?,
        title: row.get(1)?,
        notes: row.get(2)?,
        list_id: row.get(3)?,
        due_at: row.get(4)?,
        is_done: row.get::<_, i32>(5)? != 0,
        done_at: row.get(6)?,
        priority: row.get(7)?,
        sort_order: row.get(8)?,
        created_at: row.get(9)?,
        updated_at: row.get(10)?,
    })
}
