import styles from "./AppShell.module.css";

/**
 * AppShell — the top-level layout skeleton.
 *
 * Slot regions (populated by plugins in M3):
 *   ┌──────────────────────────────────┐
 *   │           Header (48px)          │
 *   ├──────────┬───────────────────────┤
 *   │ Sidebar  │    Main Panel         │
 *   │ (220px)  │                       │
 *   ├──────────┴───────────────────────┤
 *   │         Capture Bar (52px)       │
 *   └──────────────────────────────────┘
 */
export function AppShell() {
  return (
    <div className={styles.root}>
      {/* ── Header ──────────────────────────────────────────────── */}
      <header className={styles.header} data-tauri-drag-region>
        <span className={styles.headerLogo}>Life Copilot</span>
        <span className={styles.headerBadge}>alpha</span>
      </header>

      {/* ── Body (sidebar + main) ───────────────────────────────── */}
      <div className={styles.body}>
        {/* sidebar-top slot */}
        <aside className={styles.sidebar}>
          <nav className={styles.sidebarNav}>
            <p className={styles.sidebarPlaceholder}>Plugins load here</p>
          </nav>
        </aside>

        {/* main-panel slot */}
        <main className={styles.main}>
          <div className={styles.mainPlaceholder}>
            <h1>Welcome to Life Copilot</h1>
            <p>Install a plugin to get started.</p>
          </div>
        </main>
      </div>

      {/* ── Capture Bar ─────────────────────────────────────────── */}
      <div className={styles.captureBar}>
        <input
          type="text"
          placeholder="Brain Dump — type anything and press Enter…"
          className={styles.captureInput}
        />
      </div>
    </div>
  );
}
