/**
 * Todo Board — three-column kanban-style panel.
 *
 * Columns:
 *   Inbox (no list)  |  Today (priority ≥ 2 or due today)  |  Done
 *
 * For M4 the board renders a flat inbox; moving between columns
 * will come in M5 (drag-and-drop with list assignments).
 */

import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { appBus } from "../../lib/event-bus";

interface Task {
  id: string;
  title: string;
  is_done: boolean;
  priority: number;
  due_at: string | null;
  created_at: string;
}

type Col = "inbox" | "today" | "done";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function classifyTask(t: Task): Col {
  if (t.is_done) return "done";
  const td = todayStr();
  if (t.priority >= 2 || (t.due_at !== null && t.due_at.slice(0, 10) <= td))
    return "today";
  return "inbox";
}

// ── State ─────────────────────────────────────────────────────────────────────

type State = { tasks: Task[]; loading: boolean; error: string | null };
type Action =
  | { type: "loading" }
  | { type: "loaded"; tasks: Task[] }
  | { type: "error"; message: string }
  | { type: "toggle"; id: string; done: boolean };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "loading":
      return { ...state, loading: true, error: null };
    case "loaded":
      return { tasks: action.tasks, loading: false, error: null };
    case "error":
      return { ...state, loading: false, error: action.message };
    case "toggle":
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === action.id ? { ...t, is_done: action.done } : t,
        ),
      };
  }
}

// ── Component ─────────────────────────────────────────────────────────────────

export function TodoBoardPanel() {
  const [state, dispatch] = useReducer(reducer, {
    tasks: [],
    loading: true,
    error: null,
  });
  const [newTitle, setNewTitle] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const loadTasks = useCallback(async () => {
    dispatch({ type: "loading" });
    try {
      const tasks = await invoke<Task[]>("task_list", { listId: null });
      dispatch({ type: "loaded", tasks });
    } catch (e) {
      dispatch({ type: "error", message: String(e) });
    }
  }, []);

  useEffect(() => {
    void loadTasks();
  }, [loadTasks]);

  useEffect(() => {
    const offs = [
      appBus.subscribe("task:created", () => void loadTasks()),
      appBus.subscribe("task:completed", () => void loadTasks()),
      appBus.subscribe("task:deleted", () => void loadTasks()),
    ];
    return () => offs.forEach((o) => o());
  }, [loadTasks]);

  async function addTask() {
    const title = newTitle.trim();
    if (!title) return;
    setNewTitle("");
    const id = crypto.randomUUID();
    try {
      await invoke("task_create", { payload: { id, title } });
      appBus.emit("task:created", { id, title });
    } catch (e) {
      console.error("[TodoBoard] task_create failed:", e);
    }
    inputRef.current?.focus();
  }

  async function toggleDone(task: Task) {
    const done = !task.is_done;
    dispatch({ type: "toggle", id: task.id, done });
    try {
      await invoke("task_complete", { id: task.id, done });
      appBus.emit("task:completed", { id: task.id });
    } catch (e) {
      dispatch({ type: "toggle", id: task.id, done: task.is_done });
    }
  }

  const inbox = state.tasks.filter((t) => classifyTask(t) === "inbox");
  const today = state.tasks.filter((t) => classifyTask(t) === "today");
  const done = state.tasks.filter((t) => classifyTask(t) === "done");

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Quick-add bar */}
      <div className="flex gap-2">
        <input
          ref={inputRef}
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && void addTask()}
          type="text"
          placeholder="Add a task…"
          className="input input-bordered input-sm flex-1 bg-base-100 text-sm
                     placeholder:text-base-content/40 select-text"
        />
        <button
          className="btn btn-primary btn-sm"
          onClick={() => void addTask()}
          disabled={!newTitle.trim()}
        >
          Add
        </button>
      </div>

      {state.error && (
        <div className="alert alert-error text-sm">{state.error}</div>
      )}

      {/* Board columns */}
      <div className="flex gap-4 flex-1 min-h-0">
        <BoardColumn
          title="Inbox"
          icon="📥"
          tasks={inbox}
          loading={state.loading}
          emptyMsg="All tasks classified."
          onToggle={toggleDone}
        />
        <BoardColumn
          title="Today"
          icon="⚡"
          tasks={today}
          loading={state.loading}
          emptyMsg="Nothing due today."
          onToggle={toggleDone}
        />
        <BoardColumn
          title="Done"
          icon="✅"
          tasks={done}
          loading={state.loading}
          emptyMsg="Nothing completed yet."
          onToggle={toggleDone}
          muted
        />
      </div>
    </div>
  );
}

// ── Board column ──────────────────────────────────────────────────────────────

interface BoardColumnProps {
  title: string;
  icon: string;
  tasks: Task[];
  loading: boolean;
  emptyMsg: string;
  onToggle: (t: Task) => void;
  muted?: boolean;
}

function BoardColumn({
  title,
  icon,
  tasks,
  loading,
  emptyMsg,
  onToggle,
  muted,
}: BoardColumnProps) {
  return (
    <div className="flex-1 flex flex-col min-h-0 rounded-xl bg-base-200 p-3 gap-2">
      <div className="flex items-center gap-2 shrink-0">
        <span>{icon}</span>
        <span className="text-sm font-semibold text-base-content">{title}</span>
        {tasks.length > 0 && (
          <span className="badge badge-sm ml-auto">{tasks.length}</span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col gap-1">
        {loading && (
          <div className="flex justify-center py-6">
            <span className="loading loading-spinner loading-sm text-primary" />
          </div>
        )}
        {!loading && tasks.length === 0 && (
          <p className="text-xs text-base-content/30 text-center py-6">
            {emptyMsg}
          </p>
        )}
        {!loading &&
          tasks.map((t) => (
            <label
              key={t.id}
              className="flex items-center gap-2 px-3 py-2 rounded-lg
                         bg-base-100 hover:bg-base-300 cursor-pointer transition-colors"
            >
              <input
                type="checkbox"
                className="checkbox checkbox-xs checkbox-primary shrink-0"
                checked={t.is_done}
                onChange={() => onToggle(t)}
              />
              <span
                className={`text-sm flex-1 ${
                  muted || t.is_done
                    ? "line-through text-base-content/40"
                    : "text-base-content"
                }`}
              >
                {t.title}
              </span>
              {t.priority >= 2 && !t.is_done && (
                <span className="text-warning text-xs">●</span>
              )}
            </label>
          ))}
      </div>
    </div>
  );
}
