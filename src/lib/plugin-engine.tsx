/**
 * PluginEngineProvider — wires the PluginLoader to the SlotRegistry and
 * exposes the engine via React context.
 *
 * Mount order in App.tsx:
 *   <SlotRegistryProvider>
 *     <PluginEngineProvider>
 *       <AppShell />
 *     </PluginEngineProvider>
 *   </SlotRegistryProvider>
 */

import {
  createContext,
  useContext,
  useMemo,
  type ComponentType,
  type ReactNode,
} from "react";

import { PluginLoader, type PluginDefinition } from "./plugin-loader";
import { createPluginContext } from "./plugin-context";
import { appBus } from "./event-bus";
import { useSlotRegistry, type SlotName } from "./slot-registry";

// ── Context ───────────────────────────────────────────────────────────────────

export interface PluginEngineValue {
  /**
   * Load a plugin from its definition object.
   * Validates the definition, calls `activate`, registers slot components.
   */
  load(def: PluginDefinition): Promise<void>;
  /**
   * Unload a previously loaded plugin by ID.
   * Calls `deactivate` (if present) and removes slot registrations.
   */
  unload(id: string): Promise<void>;
  /** Returns definitions of all currently active plugins. */
  getActive(): PluginDefinition[];
}

const PluginEngineContext = createContext<PluginEngineValue | null>(null);

// ── Provider ──────────────────────────────────────────────────────────────────

/**
 * Provides the plugin engine to the component subtree.
 *
 * **Must be mounted inside `<SlotRegistryProvider>`** so that slot
 * registrations propagate to `<SlotOutlet>` correctly.
 */
export function PluginEngineProvider({ children }: { children: ReactNode }) {
  const { register, unregister } = useSlotRegistry();

  // The loader is stable for the lifetime of the provider — recreated only
  // if register/unregister change (they don't: both come from useReducer dispatch).
  const loader = useMemo(
    () =>
      new PluginLoader(
        (id) => createPluginContext(id, appBus),
        (
          slot: SlotName,
          id: string,
          component: ComponentType,
          priority?: number,
        ) => register(slot, { id, component, priority }),
        (slot: SlotName, id: string) => unregister(slot, id),
      ),
    [register, unregister],
  );

  const value: PluginEngineValue = useMemo(
    () => ({
      load: (def) => loader.load(def),
      unload: (id) => loader.unload(id),
      getActive: () => loader.getActive(),
    }),
    [loader],
  );

  return (
    <PluginEngineContext.Provider value={value}>
      {children}
    </PluginEngineContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────

/**
 * Access the plugin engine from any component inside `<PluginEngineProvider>`.
 *
 * Example — load the built-in todo plugin on mount:
 * ```tsx
 * const engine = usePluginEngine();
 * useEffect(() => { engine.load(todoPlugin); }, [engine]);
 * ```
 */
export function usePluginEngine(): PluginEngineValue {
  const ctx = useContext(PluginEngineContext);
  if (!ctx) {
    throw new Error(
      "usePluginEngine must be used within <PluginEngineProvider>",
    );
  }
  return ctx;
}
