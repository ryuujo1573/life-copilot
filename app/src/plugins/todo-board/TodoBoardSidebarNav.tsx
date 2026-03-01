export function TodoBoardSidebarNav() {
  return (
    <button
      className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-medium
                 text-base-content hover:bg-base-300 transition-colors"
    >
      <span className="text-base">✅</span>
      Tasks
    </button>
  );
}
