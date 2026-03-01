use serde::{Deserialize, Serialize};

use crate::{db, AppResult};

// ── Types ────────────────────────────────────────────────────────────────────

#[derive(Debug, Serialize)]
pub struct RoutineItem {
    pub id: String,
    pub routine_id: String,
    pub title: String,
    pub sort_order: i32,
    /// Whether this item has been completed for `date` (YYYY-MM-DD).
    pub completed_today: bool,
}

#[derive(Debug, Serialize)]
pub struct Routine {
    pub id: String,
    pub name: String,
    pub recurrence: String,
    pub active: bool,
    pub items: Vec<RoutineItem>,
}

#[derive(Debug, Deserialize)]
pub struct CompleteItemPayload {
    pub id: String,
    pub completion_id: String,
    pub date: String, // YYYY-MM-DD
}

// ── Commands ─────────────────────────────────────────────────────────────────

/// List all active routines with their items and today's completion status.
#[tauri::command]
pub fn routine_list(date: String) -> AppResult<Vec<Routine>> {
    db::with_conn(|conn| {
        // Fetch active routines
        let mut stmt = conn.prepare(
            "SELECT id, name, recurrence, active FROM routines
             WHERE active = 1 AND deleted_at IS NULL
             ORDER BY rowid",
        )?;
        let routines_raw: Vec<(String, String, String, bool)> = stmt
            .query_map([], |row| {
                Ok((
                    row.get::<_, String>(0)?,
                    row.get::<_, String>(1)?,
                    row.get::<_, String>(2)?,
                    row.get::<_, i32>(3)? != 0,
                ))
            })?
            .collect::<Result<_, _>>()?;

        let mut routines = Vec::with_capacity(routines_raw.len());
        for (r_id, name, recurrence, active) in routines_raw {
            // Fetch items for this routine
            let mut item_stmt = conn.prepare(
                "SELECT ri.id, ri.routine_id, ri.title, ri.sort_order,
                        CASE WHEN rc.id IS NOT NULL THEN 1 ELSE 0 END AS completed_today
                 FROM routine_items ri
                 LEFT JOIN routine_completions rc
                        ON rc.item_id = ri.id AND rc.date = ?2
                 WHERE ri.routine_id = ?1 AND ri.deleted_at IS NULL
                 ORDER BY ri.sort_order",
            )?;
            let items: Vec<RoutineItem> = item_stmt
                .query_map(rusqlite::params![r_id, date], |row| {
                    Ok(RoutineItem {
                        id: row.get(0)?,
                        routine_id: row.get(1)?,
                        title: row.get(2)?,
                        sort_order: row.get(3)?,
                        completed_today: row.get::<_, i32>(4)? != 0,
                    })
                })?
                .collect::<Result<_, _>>()?;

            routines.push(Routine {
                id: r_id,
                name,
                recurrence,
                active,
                items,
            });
        }
        Ok(routines)
    })
}

/// Mark a routine item as complete for a given date (idempotent upsert).
#[tauri::command]
pub fn routine_complete(payload: CompleteItemPayload) -> AppResult<()> {
    db::with_conn(|conn| {
        conn.execute(
            "INSERT INTO routine_completions (id, item_id, date)
             VALUES (?1, ?2, ?3)
             ON CONFLICT (item_id, date) DO NOTHING",
            rusqlite::params![payload.completion_id, payload.id, payload.date],
        )?;
        Ok(())
    })
}

/// Undo a routine item completion for a given date.
#[tauri::command]
pub fn routine_uncomplete(item_id: String, date: String) -> AppResult<()> {
    db::with_conn(|conn| {
        conn.execute(
            "DELETE FROM routine_completions WHERE item_id = ?1 AND date = ?2",
            rusqlite::params![item_id, date],
        )?;
        Ok(())
    })
}
