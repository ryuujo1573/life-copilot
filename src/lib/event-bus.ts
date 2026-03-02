/**
 * Typed application event bus.
 *
 * Plugins and core modules communicate exclusively through this bus —
 * no direct imports between features, keeping them fully decoupled.
 *
 * Usage:
 *   // Subscribe (returns a cleanup function)
 *   const off = appBus.subscribe("task:created", ({ id, title }) => { … });
 *   // Emit
 *   appBus.emit("task:created", { id: "abc", title: "Buy milk" });
 *   // Unsubscribe
 *   off();
 */

type Handler<T> = (payload: T) => void;

// ── Domain event map ─────────────────────────────────────────────────────────

/**
 * All application-level events and their payload shapes.
 * Extend this interface when adding new domain events.
 */
export interface AppEventMap {
  // ── Tasks ─────────────────────────────────────────────────────────────────
  "task:created": { id: string; title: string; listId?: string };
  "task:updated": { id: string; title?: string; done?: boolean };
  "task:completed": { id: string };
  "task:deleted": { id: string };

  // ── Capture bar ───────────────────────────────────────────────────────────
  /** Emitted when the user submits text via the Brain Dump capture bar. */
  "capture:submit": { text: string };

  // ── Focus session ─────────────────────────────────────────────────────────
  "session:start": { duration: number };
  "session:tick": { remaining: number };
  "session:complete": { elapsed: number };
  "session:pause": undefined;
  "session:resume": undefined;
  "session:abort": undefined;

  // ── Routines ──────────────────────────────────────────────────────────────
  "routine:completed": { id: string; date: string };

  // ── Plugin lifecycle ──────────────────────────────────────────────────────
  "plugin:activated": { id: string };
  "plugin:deactivated": { id: string };
}

// ── EventBus class ───────────────────────────────────────────────────────────

/**
 * Lightweight, strongly-typed publish/subscribe event bus.
 *
 * @typeParam TMap - A record mapping event names to their payload types.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class EventBus<TMap extends Record<string, any>> {
  private readonly listeners = new Map<keyof TMap, Set<Handler<unknown>>>();

  /**
   * Emit an event. All registered handlers are called synchronously in
   * insertion order.
   */
  emit<K extends keyof TMap>(event: K, payload: TMap[K]): void {
    this.listeners.get(event)?.forEach((h) => h(payload as unknown));
  }

  /**
   * Subscribe to an event.
   * @returns A cleanup function that removes the handler when called.
   */
  subscribe<K extends keyof TMap>(
    event: K,
    handler: Handler<TMap[K]>,
  ): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler as Handler<unknown>);
    return () => this.unsubscribe(event, handler);
  }

  /** Manually remove a previously registered handler. */
  unsubscribe<K extends keyof TMap>(event: K, handler: Handler<TMap[K]>): void {
    this.listeners.get(event)?.delete(handler as Handler<unknown>);
  }

  /**
   * Remove all handlers for a specific event, or all events when called
   * with no argument.
   */
  clear(event?: keyof TMap): void {
    if (event !== undefined) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }
}

// ── Singleton ────────────────────────────────────────────────────────────────

/** Application-wide event bus. Import this instance throughout the app. */
export const appBus = new EventBus<AppEventMap>();
