/**
 * AppShell — the top-level layout skeleton.
 *
 * Each region corresponds to a named slot that plugins register into.
 * Fallback content is shown when no plugin occupies a slot.
 *
 *   ┌──────────────────────────────────┐
 *   │           Header (48px)          │
 *   ├──────────┬───────────────────────┤
 *   │ sidebar- │                        │
 *   │  top     │    main-panel          │
 *   │ sidebar- │                        │
 *   │  bottom  │                        │
 *   ├──────────┴───────────────────────┤
 *   │      capture-bar (52px)           │
 *   ├───────────────────────────────────┤
 *   │      status-bar                   │
 *   └───────────────────────────────────┘
 */

import { SlotOutlet } from "../lib/slot-registry";

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
        {/* ── Sidebar ─────────────────────────────────────────── */}
        <aside className="w-[220px] bg-base-200 border-r border-neutral flex flex-col shrink-0 overflow-y-auto">
          {/* sidebar-top: primary nav / plugin panels */}
          <nav className="flex-1 p-3">
            <SlotOutlet
              name="sidebar-top"
              className="flex flex-col gap-1"
              fallback={
                <p className="text-sm text-base-content/40 text-center pt-8">
                  Plugins load here
                </p>
              }
            />
          </nav>

          {/* sidebar-bottom: settings, account, etc. */}
          <SlotOutlet name="sidebar-bottom" className="p-3" />
        </aside>

        {/* ── Main panel ──────────────────────────────────────── */}
        <main className="flex-1 overflow-y-auto p-8 flex flex-col">
          <SlotOutlet
            name="main-panel"
            className="flex-1 flex flex-col"
            fallback={
              <div className="m-auto text-center">
                <h1 className="text-2xl font-bold text-base-content mb-3">
                  Welcome to Life Copilot
                </h1>
                <p className="text-base-content/50">
                  Install a plugin to get started.
                </p>
              </div>
            }
          />
        </main>
      </div>

      {/* ── Capture Bar ─────────────────────────────────────────── */}
      <div className="flex items-center gap-2 h-[52px] px-4 bg-base-200 border-t border-neutral shrink-0">
        <input
          type="text"
          placeholder="Brain Dump — type anything and press Enter…"
          className="input input-bordered flex-1 rounded-full bg-base-100 text-sm placeholder:text-base-content/40 select-text"
        />
        {/* Plugins can append actions next to the input */}
        <SlotOutlet name="capture-bar" className="flex items-center gap-2" />
      </div>

      {/* ── Status Bar ──────────────────────────────────────────── */}
      <SlotOutlet
        name="status-bar"
        className="flex items-center gap-3 h-6 px-4 bg-base-300 text-xs text-base-content/50 shrink-0"
      />
    </div>
  );
}
