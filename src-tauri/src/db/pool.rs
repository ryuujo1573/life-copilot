use std::path::PathBuf;
use std::sync::Mutex;

use once_cell::sync::OnceCell;
use rusqlite::Connection;

use crate::AppResult;
use super::migrations;

/// A single, mutex-guarded SQLite connection.
///
/// SQLite itself is thread-safe in serialized mode (the default when linked
/// with the `bundled` feature). A single connection with WAL journal mode is
/// the simplest and most reliable approach for a single-user desktop app.
///
/// For the future sync/CRDT work we will evaluate a connection pool; for now
/// serialised access through this global is sufficient.
static DB: OnceCell<Mutex<Connection>> = OnceCell::new();

/// Open (or create) the database, apply pragma tuning, and run pending
/// migrations. Called once from `lib.rs` during app setup.
pub fn init(path: PathBuf) -> AppResult<()> {
    let conn = Connection::open(&path)?;
    configure(&conn)?;
    migrations::run(&conn)?;

    DB.set(Mutex::new(conn))
        .map_err(|_| crate::AppError::Other("DB already initialised".into()))?;

    Ok(())
}

/// Execute a closure with exclusive access to the database connection.
///
/// # Panics
/// Panics if the DB has not been initialised (i.e. `init` was never called).
pub fn with_conn<F, T>(f: F) -> AppResult<T>
where
    F: FnOnce(&Connection) -> AppResult<T>,
{
    let guard = DB
        .get()
        .expect("DB not initialised")
        .lock()
        .expect("DB mutex poisoned");
    f(&guard)
}

// ── Private helpers ────────────────────────────────────────────────────────

/// Apply recommended SQLite pragmas for a local-first desktop app.
fn configure(conn: &Connection) -> AppResult<()> {
    conn.execute_batch("
        -- Enable WAL journal mode: readers don't block writers, writes don't
        -- block readers.  Also survives crashes without corruption.
        PRAGMA journal_mode = WAL;

        -- Wait up to 5 seconds before returning SQLITE_BUSY instead of
        -- immediately erroring on a locked table.
        PRAGMA busy_timeout = 5000;

        -- Enforce foreign-key constraints (off by default in SQLite).
        PRAGMA foreign_keys = ON;

        -- Balanced durability: flush at checkpoint, not on every commit.
        PRAGMA synchronous = NORMAL;

        -- 32 MB page cache keeps hot data in RAM.
        PRAGMA cache_size = -32000;

        -- Store temp tables in memory.
        PRAGMA temp_store = MEMORY;

        -- 8 KB pages are a better fit for row-heavy workloads than the 4 KB
        -- default (only takes effect on a fresh database).
        PRAGMA page_size = 8192;
    ")?;

    Ok(())
}
