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
    <div className="flex flex-col h-full bg-base-100 overflow-hidden">
      {/* ── Header ──────────────────────────────────────────────── */}
      <header
        className="flex items-center gap-3 h-12 px-4 bg-base-200 border-b border-neutral shrink-0"
        data-tauri-drag-region
      >
        <span className="font-bold text-lg tracking-tight text-base-content">
          Life Copilot
        </span>
        <span className="badge badge-primary badge-sm font-semibold uppercase tracking-widest">
          alpha
        </span>
      </header>

      {/* ── Body (sidebar + main) ───────────────────────────────── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* sidebar — sidebar-top slot */}
        <aside className="w-[220px] bg-base-200 border-r border-neutral flex flex-col shrink-0 overflow-y-auto">
          <nav className="flex-1 p-3">
            <p className="text-sm text-base-content/40 text-center pt-8">
              Plugins load here
            </p>
          </nav>
        </aside>

        {/* main-panel slot */}
        <main className="flex-1 overflow-y-auto p-8 flex flex-col">
          <div className="m-auto text-center">
            <h1 className="text-2xl font-bold text-base-content mb-3">
              Welcome to Life Copilot
            </h1>
            <p className="text-base-content/50">
              Install a plugin to get started.
            </p>
          </div>
        </main>
      </div>

      {/* ── Capture Bar ─────────────────────────────────────────── */}
      <div className="flex items-center h-[52px] px-4 bg-base-200 border-t border-neutral shrink-0">
        <input
          type="text"
          placeholder="Brain Dump — type anything and press Enter…"
          className="input input-bordered w-full rounded-full bg-base-100 text-sm placeholder:text-base-content/40 select-text"
        />
      </div>
    </div>
  );
}
