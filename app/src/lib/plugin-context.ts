/**
 * PluginContext — the capability object handed to every plugin on activation.
 *
 * Plugins receive a bound PluginContext in their `activate(ctx)` function and
 * use it to interact with the host app without importing internal modules
 * directly.
 */

import { invoke } from "@tauri-apps/api/core";
import type { EventBus, AppEventMap } from "./event-bus";
// EventBus<AppEventMap> is valid: AppEventMap extends Record<string, any>

// ── PluginStorage ────────────────────────────────────────────────────────────

/**
 * Namespaced key/value storage backed by the `plugin_storage` SQLite table.
 *
 * All keys are automatically scoped to the owning plugin's ID — plugins
 * cannot read or overwrite each other's data.
 */
export interface PluginStorage {
  /** Retrieve a stored value, or `null` if the key does not exist. */
  get<T = unknown>(key: string): Promise<T | null>;
  /**
   * Persist a value. The value is JSON-serialised before being written.
   * Overwrites any previously stored value for the same key.
   */
  set<T = unknown>(key: string, value: T): Promise<void>;
  /** Delete a key. Resolves silently if the key does not exist. */
  delete(key: string): Promise<void>;
}

// ── PluginContext ────────────────────────────────────────────────────────────

/**
 * The context object passed to every plugin's `activate` function.
 *
 * It intentionally mirrors a minimal, stable API surface so plugins remain
 * forward-compatible as the host app evolves.
 */
export interface PluginContext {
  /** Unique identifier of the plugin that owns this context. */
  readonly pluginId: string;

  /**
   * Application-wide event bus.
   * Subscribe to events from core or other plugins, and emit your own.
   */
  readonly events: EventBus<AppEventMap>;

  /**
   * Namespaced persistent storage.
   * Values survive app restarts and are scoped to this plugin.
   */
  readonly storage: PluginStorage;

  /**
   * Call a Tauri backend command.
   * Identical signature to `@tauri-apps/api/core` `invoke` — no extra
   * wrappers, no re-exports.
   */
  readonly invoke: typeof invoke;
}

// ── Factory ──────────────────────────────────────────────────────────────────

/**
 * Create a bound `PluginContext` for the given plugin.
 *
 * The storage implementation delegates to three Tauri commands:
 *   - `plugin_storage_get`
 *   - `plugin_storage_set`
 *   - `plugin_storage_delete`
 *
 * These commands are registered in `src-tauri/src/commands/plugin_storage.rs`.
 */
export function createPluginContext(
  pluginId: string,
  bus: EventBus<AppEventMap>,
): PluginContext {
  const storage: PluginStorage = {
    async get<T>(key: string): Promise<T | null> {
      const raw = await invoke<string | null>("plugin_storage_get", {
        pluginId,
        key,
      });
      if (raw === null) return null;
      return JSON.parse(raw) as T;
    },

    async set<T>(key: string, value: T): Promise<void> {
      await invoke("plugin_storage_set", {
        pluginId,
        key,
        value: JSON.stringify(value),
      });
    },

    async delete(key: string): Promise<void> {
      await invoke("plugin_storage_delete", { pluginId, key });
    },
  };

  return { pluginId, events: bus, storage, invoke };
}
