/**
 * Brain Dump — Inbox panel (main-panel slot).
 *
 * Lists all tasks with no list_id (= inbox).
 * Refreshes whenever `task:created` or `task:completed` is emitted.
 */

import { useCallback, useEffect, useReducer, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { appBus } from "../../lib/event-bus";

interface Task {
  id: string;
  title: string;
  notes: string | null;
  is_done: boolean;
  created_at: string;
}

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

export function BrainDumpPanel() {
  const [state, dispatch] = useReducer(reducer, {
    tasks: [],
    loading: true,
    error: null,
  });
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadTasks = useCallback(async () => {
    dispatch({ type: "loading" });
    try {
      const tasks = await invoke<Task[]>("task_list", { listId: null });
      dispatch({ type: "loaded", tasks });
    } catch (e) {
      dispatch({ type: "error", message: String(e) });
    }
  }, []);

  // Initial load
  useEffect(() => {
    void loadTasks();
  }, [loadTasks]);

  // Refresh on task events
  useEffect(() => {
    const off1 = appBus.subscribe("task:created", () => void loadTasks());
    const off2 = appBus.subscribe("task:completed", () => void loadTasks());
    return () => { off1(); off2(); };
  }, [loadTasks]);

  async function toggleDone(task: Task) {
    const newDone = !task.is_done;
    dispatch({ type: "toggle", id: task.id, done: newDone });
    try {
      await invoke("task_complete", { id: task.id, done: newDone });
      appBus.emit("task:completed", { id: task.id });
    } catch (e) {
      // Revert
      dispatch({ type: "toggle", id: task.id, done: task.is_done });
      console.error("[BrainDump] task_complete failed:", e);
    }
  }

  async function deleteTask(id: string) {
    setDeletingId(id);
    try {
      await invoke("task_delete", { id });
      appBus.emit("task:deleted", { id });
      await loadTasks();
    } catch (e) {
      console.error("[BrainDump] task_delete failed:", e);
    } finally {
      setDeletingId(null);
    }
  }

  const pending = state.tasks.filter((t) => !t.is_done);
  const done = state.tasks.filter((t) => t.is_done);

  return (
    <div className="flex flex-col gap-6 w-full max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <span className="text-2xl">📥</span>
        <h1 className="text-xl font-bold text-base-content">Inbox</h1>
        {pending.length > 0 && (
          <span className="badge badge-primary badge-sm">{pending.length}</span>
        )}
      </div>

      {state.error && (
        <div className="alert alert-error text-sm">{state.error}</div>
      )}

      {state.loading && (
        <div className="flex justify-center py-12">
          <span className="loading loading-spinner loading-md text-primary" />
        </div>
      )}

      {!state.loading && state.tasks.length === 0 && (
        <div className="text-center py-16 text-base-content/40">
          <p className="text-4xl mb-3">✨</p>
          <p className="text-sm">Inbox zero! Type something above to capture a thought.</p>
        </div>
      )}

      {/* Pending tasks */}
      {pending.length > 0 && (
        <ul className="flex flex-col gap-2">
          {pending.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              isDeleting={deletingId === task.id}
              onToggle={() => void toggleDone(task)}
              onDelete={() => void deleteTask(task.id)}
            />
          ))}
        </ul>
      )}

      {/* Completed tasks */}
      {done.length > 0 && (
        <details className="group">
          <summary className="cursor-pointer text-xs font-semibold uppercase tracking-widest text-base-content/40 select-none mb-2">
            Completed ({done.length})
          </summary>
          <ul className="flex flex-col gap-2">
            {done.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                isDeleting={deletingId === task.id}
                onToggle={() => void toggleDone(task)}
                onDelete={() => void deleteTask(task.id)}
              />
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}

// ── Sub-component ─────────────────────────────────────────────────────────────

interface TaskRowProps {
  task: Task;
  isDeleting: boolean;
  onToggle: () => void;
  onDelete: () => void;
}

function TaskRow({ task, isDeleting, onToggle, onDelete }: TaskRowProps) {
  return (
    <li className="flex items-center gap-3 px-4 py-3 rounded-xl bg-base-200
                   hover:bg-base-300 transition-colors group">
      <input
        type="checkbox"
        className="checkbox checkbox-primary checkbox-sm shrink-0"
        checked={task.is_done}
        onChange={onToggle}
      />
      <span
        className={`flex-1 text-sm text-base-content ${
          task.is_done ? "line-through opacity-40" : ""
        }`}
      >
        {task.title}
      </span>
      <button
        className="btn btn-ghost btn-xs opacity-0 group-hover:opacity-100 transition-opacity
                   text-error"
        onClick={onDelete}
        disabled={isDeleting}
        aria-label="Delete task"
      >
        {isDeleting ? (
          <span className="loading loading-spinner loading-xs" />
        ) : (
          "✕"
        )}
      </button>
    </li>
  );
}
