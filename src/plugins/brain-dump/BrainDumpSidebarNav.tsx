/** Sidebar navigation entry for the Brain Dump inbox. */
export function BrainDumpSidebarNav() {
  return (
    <button
      className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-medium
                 text-base-content hover:bg-base-300 active:bg-base-300 transition-colors"
      onClick={() => {
        // Future: drive active-panel state through event bus or React context
        console.info("[BrainDump] Sidebar nav pressed");
      }}
    >
      <span className="text-base">📥</span>
      Inbox
    </button>
  );
}
