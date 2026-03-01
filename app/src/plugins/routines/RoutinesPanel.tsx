/**
 * Routines panel — daily checklist with streak badges.
 *
 * Loads all active routines for today's date.
 * Tapping an item marks it complete via `routine_complete` IPC.
 * Progress bar shows items done / total.
 */

import { useCallback, useEffect, useReducer } from "react";
import { invoke } from "@tauri-apps/api/core";
import { appBus } from "../../lib/event-bus";

interface RoutineItem {
  id: string;
  routine_id: string;
  title: string;
  sort_order: number;
  completed_today: boolean;
}

interface Routine {
  id: string;
  name: string;
  recurrence: string;
  items: RoutineItem[];
}

type State = { routines: Routine[]; loading: boolean; error: string | null };
type Action =
  | { type: "loading" }
  | { type: "loaded"; routines: Routine[] }
  | { type: "error"; message: string }
  | { type: "toggle"; itemId: string; done: boolean };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "loading": return { ...state, loading: true, error: null };
    case "loaded": return { routines: action.routines, loading: false, error: null };
    case "error": return { ...state, loading: false, error: action.message };
    case "toggle":
      return {
        ...state,
        routines: state.routines.map((r) => ({
          ...r,
          items: r.items.map((item) =>
            item.id === action.itemId
              ? { ...item, completed_today: action.done }
              : item,
          ),
        })),
      };
  }
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export function RoutinesPanel() {
  const [state, dispatch] = useReducer(reducer, {
    routines: [],
    loading: true,
    error: null,
  });

  const loadRoutines = useCallback(async () => {
    dispatch({ type: "loading" });
    try {
      const routines = await invoke<Routine[]>("routine_list", {
        date: todayStr(),
      });
      dispatch({ type: "loaded", routines });
    } catch (e) {
      dispatch({ type: "error", message: String(e) });
    }
  }, []);

  useEffect(() => { void loadRoutines(); }, [loadRoutines]);

  // Reload when date changes (midnight crossing — cheap polling)
  useEffect(() => {
    const interval = setInterval(() => void loadRoutines(), 60_000);
    return () => clearInterval(interval);
  }, [loadRoutines]);

  useEffect(() => {
    const off = appBus.subscribe("routine:completed", () => void loadRoutines());
    return off;
  }, [loadRoutines]);

  async function toggleItem(item: RoutineItem) {
    const date = todayStr();
    const newDone = !item.completed_today;
    dispatch({ type: "toggle", itemId: item.id, done: newDone });

    try {
      if (newDone) {
        const completionId = crypto.randomUUID();
        await invoke("routine_complete", {
          payload: { id: item.id, completionId, date },
        });
        appBus.emit("routine:completed", { id: item.routine_id, date });
      } else {
        await invoke("routine_uncomplete", { itemId: item.id, date });
      }
    } catch (e) {
      // Revert
      dispatch({ type: "toggle", itemId: item.id, done: item.completed_today });
      console.error("[Routines] toggle failed:", e);
    }
  }

  // Aggregate progress across all routines
  const totalItems = state.routines.reduce((s, r) => s + r.items.length, 0);
  const doneItems = state.routines.reduce(
    (s, r) => s + r.items.filter((i) => i.completed_today).length,
    0,
  );
  const pct = totalItems > 0 ? Math.round((doneItems / totalItems) * 100) : 0;

  return (
    <div className="flex flex-col gap-6 w-full max-w-2xl mx-auto">
      {/* Header + progress */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🔁</span>
          <h1 className="text-xl font-bold text-base-content">Daily Routines</h1>
          <span className="ml-auto text-sm font-semibold text-base-content/60">
            {doneItems}/{totalItems}
          </span>
        </div>
        {totalItems > 0 && (
          <progress
            className="progress progress-primary w-full h-2"
            value={pct}
            max={100}
          />
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

      {!state.loading && state.routines.length === 0 && (
        <div className="text-center py-16 text-base-content/40">
          <p className="text-4xl mb-3">🔁</p>
          <p className="text-sm">No routines set up yet.</p>
          <p className="text-xs mt-1 opacity-60">
            Add routines directly in the database for now (M5 will add a UI).
          </p>
        </div>
      )}

      {/* Routine groups */}
      {state.routines.map((routine) => {
        const rdone = routine.items.filter((i) => i.completed_today).length;
        const rtotal = routine.items.length;
        return (
          <div key={routine.id} className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-widest
                               text-base-content/50">
                {routine.name}
              </span>
              <span className="badge badge-sm badge-ghost ml-auto">
                {rdone}/{rtotal}
              </span>
            </div>
            <ul className="flex flex-col gap-1">
              {routine.items.map((item) => (
                <li key={item.id}>
                  <label
                    className="flex items-center gap-3 px-4 py-3 rounded-xl bg-base-200
                               hover:bg-base-300 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      className="checkbox checkbox-primary checkbox-sm shrink-0"
                      checked={item.completed_today}
                      onChange={() => void toggleItem(item)}
                    />
                    <span
                      className={`flex-1 text-sm ${
                        item.completed_today
                          ? "line-through text-base-content/40"
                          : "text-base-content"
                      }`}
                    >
                      {item.title}
                    </span>
                    {item.completed_today && (
                      <span className="text-success text-xs">✓</span>
                    )}
                  </label>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
