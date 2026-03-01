use rusqlite::Connection;

use crate::AppResult;

/// A single migration entry.
struct Migration {
    /// Monotonically increasing version number.
    version: u32,
    /// Human-readable name, stored in `schema_migrations` for debugging.
    name: &'static str,
    /// Raw SQL; multiple statements separated by semicolons are supported.
    sql: &'static str,
}

// ── Migration registry ─────────────────────────────────────────────────────

/// All migrations in ascending version order.
/// Add new migrations to the END of this slice only — never reorder or edit
/// an existing entry once it has been applied to a database.
static MIGRATIONS: &[Migration] = &[Migration {
    version: 1,
    name: "init_core_schema",
    sql: include_str!("migrations/0001_init.sql"),
}];

// ── Runner ─────────────────────────────────────────────────────────────────

/// Apply all pending migrations in order.
///
/// The runner:
/// 1. Creates `schema_migrations` if it doesn't exist.
/// 2. Reads the highest applied version.
/// 3. Runs every migration whose version is greater, in a single transaction.
/// 4. Records each migration version before moving to the next.
pub fn run(conn: &Connection) -> AppResult<()> {
    // Ensure the tracking table exists.
    conn.execute_batch(
        "
        CREATE TABLE IF NOT EXISTS schema_migrations (
            version    INTEGER PRIMARY KEY,
            name       TEXT    NOT NULL,
            applied_at TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
        );
    ",
    )?;

    let current: u32 = conn
        .query_row(
            "SELECT COALESCE(MAX(version), 0) FROM schema_migrations",
            [],
            |row| row.get(0),
        )
        .unwrap_or(0);

    let pending: Vec<&Migration> = MIGRATIONS.iter().filter(|m| m.version > current).collect();

    if pending.is_empty() {
        return Ok(());
    }

    // Run all pending migrations inside one transaction so a partial failure
    // leaves the database unchanged.
    let tx = conn.unchecked_transaction()?;

    for migration in &pending {
        tx.execute_batch(migration.sql)?;
        tx.execute(
            "INSERT INTO schema_migrations (version, name) VALUES (?1, ?2)",
            rusqlite::params![migration.version, migration.name],
        )?;
        log::info!("migration {}: {}", migration.version, migration.name);
    }

    tx.commit()?;
    Ok(())
}
