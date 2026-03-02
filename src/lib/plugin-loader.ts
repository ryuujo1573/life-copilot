/**
 * PluginLoader — manages the lifecycle of all loaded plugins.
 *
 * Flow:
 *   1. Consumer calls `loader.load(def)`
 *   2. Loader validates the definition (throws on invalid shape)
 *   3. A bound PluginContext is created via the injected `createCtx` factory
 *   4. `def.activate(ctx)` is awaited
 *   5. Each `def.slots` entry is registered in the SlotRegistry
 *   6. A `"plugin:activated"` event is emitted on the app bus
 *
 * Unloading reverses steps 4-6 via `def.deactivate?.()`.
 */

import type { ComponentType } from "react";
import type { SlotName } from "./slot-registry";
import type { PluginContext } from "./plugin-context";

// ── PluginDefinition ─────────────────────────────────────────────────────────

export interface PluginSlotRegistration {
  /** The named AppShell region where this component will appear. */
  slot: SlotName;
  component: ComponentType;
  /**
   * Render priority within the slot — higher renders first.
   * Defaults to 0.
   */
  priority?: number;
}

/**
 * The shape every plugin module must conform to.
 *
 * Built-in plugins (M4 ADHD modules) live in `app/src/plugins/`.
 * Third-party plugins would ship as separate packages loaded at runtime.
 */
export interface PluginDefinition {
  /**
   * Unique reverse-domain identifier, e.g. `"app.lifecopilot.todo"`.
   * Must be stable — it keys the plugin's storage namespace.
   */
  id: string;
  /** Human-readable display name shown in the plugin list. */
  name: string;
  /** SemVer string, e.g. `"1.0.0"`. */
  version: string;
  /** UI components to inject into named AppShell slots. */
  slots?: PluginSlotRegistration[];
  /**
   * Called once when the plugin is loaded.
   *
   * Perform all setup here: subscribe to events, load initial state from
   * storage, register timers, etc.
   */
  activate(ctx: PluginContext): Promise<void> | void;
  /**
   * Called once when the plugin is unloaded.
   *
   * Tear down subscriptions and flush any pending writes here.
   * Return value is ignored; errors are caught and logged.
   *
   * Optional — if omitted, unloading only removes slot registrations.
   */
  deactivate?(): Promise<void> | void;
}

// ── PluginLoader class ───────────────────────────────────────────────────────

interface LoadedPlugin {
  definition: PluginDefinition;
  context: PluginContext;
}

/**
 * Do not instantiate directly — use the `usePluginEngine` hook instead.
 * The React provider handles dependency injection (createCtx, slot callbacks).
 */
export class PluginLoader {
  private readonly plugins = new Map<string, LoadedPlugin>();

  constructor(
    /**
     * Factory that produces a bound PluginContext for a given plugin ID.
     * Injected by PluginEngineProvider so the loader stays framework-agnostic.
     */
    private readonly createCtx: (pluginId: string) => PluginContext,
    /**
     * Callback to register a slot component in the SlotRegistry React context.
     * Injected by PluginEngineProvider.
     */
    private readonly slotRegister: (
      slot: SlotName,
      id: string,
      component: ComponentType,
      priority?: number,
    ) => void,
    /**
     * Callback to unregister a slot component from the SlotRegistry.
     * Injected by PluginEngineProvider.
     */
    private readonly slotUnregister: (slot: SlotName, id: string) => void,
  ) {}

  // ── Public API ─────────────────────────────────────────────────────────────

  /**
   * Load and activate a plugin from its definition.
   *
   * @throws If the definition fails validation.
   * @throws If `activate` throws.
   */
  async load(def: PluginDefinition): Promise<void> {
    if (this.plugins.has(def.id)) {
      console.warn(`[PluginLoader] Plugin "${def.id}" is already loaded.`);
      return;
    }

    this.validate(def);

    const ctx = this.createCtx(def.id);
    await def.activate(ctx);

    this.plugins.set(def.id, { definition: def, context: ctx });

    for (const reg of def.slots ?? []) {
      this.slotRegister(
        reg.slot,
        `${def.id}::${reg.slot}`,
        reg.component,
        reg.priority,
      );
    }

    ctx.events.emit("plugin:activated", { id: def.id });
    console.info(`[PluginLoader] "${def.id}" v${def.version} activated.`);
  }

  /**
   * Deactivate and unload a plugin by ID.
   *
   * Silently no-ops if the plugin is not currently loaded.
   * Errors thrown by `deactivate` are caught and logged.
   */
  async unload(id: string): Promise<void> {
    const loaded = this.plugins.get(id);
    if (!loaded) {
      console.warn(`[PluginLoader] Plugin "${id}" is not loaded.`);
      return;
    }

    try {
      await loaded.definition.deactivate?.();
    } catch (err) {
      console.error(`[PluginLoader] Error deactivating "${id}":`, err);
    }

    for (const reg of loaded.definition.slots ?? []) {
      this.slotUnregister(reg.slot, `${id}::${reg.slot}`);
    }

    loaded.context.events.emit("plugin:deactivated", { id });
    this.plugins.delete(id);
    console.info(`[PluginLoader] "${id}" deactivated.`);
  }

  /** Returns the definitions of all currently active plugins. */
  getActive(): PluginDefinition[] {
    return Array.from(this.plugins.values()).map((p) => p.definition);
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  private validate(def: PluginDefinition): void {
    if (!def.id || typeof def.id !== "string") {
      throw new Error("Plugin must have a non-empty string `id`.");
    }
    if (!def.name || typeof def.name !== "string") {
      throw new Error(
        `Plugin "${def.id}" must have a non-empty string \`name\`.`,
      );
    }
    if (!def.version || typeof def.version !== "string") {
      throw new Error(
        `Plugin "${def.id}" must have a non-empty string \`version\`.`,
      );
    }
    if (typeof def.activate !== "function") {
      throw new Error(
        `Plugin "${def.id}" must export an \`activate\` function.`,
      );
    }
  }
}
