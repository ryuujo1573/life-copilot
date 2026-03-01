/**
 * Focus Timer — Pomodoro-style timer in the status bar slot.
 *
 * States: idle → running → paused → complete
 * Emits session:start / session:tick / session:pause / session:resume /
 *        session:complete / session:abort on the app event bus.
 * On complete or abort, saves the session to the DB via focus_session_save.
 */

import { useEffect, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { appBus } from "../../lib/event-bus";

type TimerState = "idle" | "running" | "paused" | "complete";

const PRESETS = [25, 15, 5] as const;

function fmt(seconds: number) {
  const m = String(Math.floor(seconds / 60)).padStart(2, "0");
  const s = String(seconds % 60).padStart(2, "0");
  return `${m}:${s}`;
}

export function FocusTimer() {
  const [timerState, setTimerState] = useState<TimerState>("idle");
  const [preset, setPreset] = useState<number>(25);
  const [remaining, setRemaining] = useState<number>(25 * 60);
  const sessionIdRef = useRef<string>(crypto.randomUUID());
  const startTimeRef = useRef<number>(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Tick
  useEffect(() => {
    if (timerState !== "running") return;
    intervalRef.current = setInterval(() => {
      setRemaining((r) => {
        const next = r - 1;
        appBus.emit("session:tick", { remaining: next });
        if (next <= 0) {
          clearInterval(intervalRef.current!);
          setTimerState("complete");
          const elapsed = Math.round(
            (Date.now() - startTimeRef.current) / 60_000,
          );
          appBus.emit("session:complete", { elapsed });
          void saveSession(sessionIdRef.current, preset, elapsed, false);
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current!);
  }, [timerState, preset]);

  function start() {
    const id = crypto.randomUUID();
    sessionIdRef.current = id;
    startTimeRef.current = Date.now();
    setRemaining(preset * 60);
    setTimerState("running");
    appBus.emit("session:start", { duration: preset });
  }

  function pause() {
    clearInterval(intervalRef.current!);
    setTimerState("paused");
    appBus.emit("session:pause", undefined);
  }

  function resume() {
    setTimerState("running");
    appBus.emit("session:resume", undefined);
  }

  function abort() {
    clearInterval(intervalRef.current!);
    const elapsed = Math.round((Date.now() - startTimeRef.current) / 60_000);
    appBus.emit("session:abort", undefined);
    void saveSession(sessionIdRef.current, preset, elapsed, true);
    reset();
  }

  function reset() {
    clearInterval(intervalRef.current!);
    setTimerState("idle");
    setRemaining(preset * 60);
  }

  // Idle UI
  if (timerState === "idle") {
    return (
      <div className="flex items-center gap-3 px-3 w-full h-full">
        <span className="text-xs text-base-content/50 shrink-0">Focus:</span>
        <div className="flex gap-1">
          {PRESETS.map((p) => (
            <button
              key={p}
              className={`btn btn-xs ${
                preset === p ? "btn-primary" : "btn-ghost"
              }`}
              onClick={() => setPreset(p)}
            >
              {p}m
            </button>
          ))}
        </div>
        <button className="btn btn-xs btn-success ml-1" onClick={start}>
          ▶ Start
        </button>
      </div>
    );
  }

  // Complete UI
  if (timerState === "complete") {
    return (
      <div className="flex items-center gap-3 px-3 w-full h-full">
        <span className="text-success text-xs font-semibold">
          ✓ Session complete!
        </span>
        <button className="btn btn-xs btn-ghost ml-auto" onClick={reset}>
          New
        </button>
      </div>
    );
  }

  // Running / paused UI
  const pct = Math.round(((preset * 60 - remaining) / (preset * 60)) * 100);

  return (
    <div className="flex items-center gap-3 px-3 w-full h-full">
      <span className="text-xs text-base-content/50 shrink-0">Focus</span>
      {/* Radial-ish progress via progress element */}
      <progress
        className="progress progress-primary w-16 h-1.5"
        value={pct}
        max={100}
      />
      <span
        className={`text-xs font-mono font-bold tabular-nums ${
          remaining <= 60 ? "text-warning animate-pulse" : "text-base-content"
        }`}
      >
        {fmt(remaining)}
      </span>
      {timerState === "running" ? (
        <button className="btn btn-xs btn-ghost" onClick={pause} title="Pause">
          ⏸
        </button>
      ) : (
        <button
          className="btn btn-xs btn-ghost"
          onClick={resume}
          title="Resume"
        >
          ▶
        </button>
      )}
      <button
        className="btn btn-xs btn-ghost text-error"
        onClick={abort}
        title="Abort session"
      >
        ✕
      </button>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

async function saveSession(
  id: string,
  plannedMinutes: number,
  actualMinutes: number,
  interrupted: boolean,
) {
  try {
    await invoke("focus_session_save", {
      payload: {
        id,
        taskId: null,
        plannedMinutes,
        actualMinutes,
        interrupted,
        notes: null,
      },
    });
  } catch (e) {
    console.error("[FocusTimer] focus_session_save failed:", e);
  }
}
