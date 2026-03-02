/**
 * Slot Registry — lets plugins inject React components into named AppShell regions.
 *
 * Architecture:
 *   <SlotRegistryProvider>          ← holds the registry state
 *     <PluginEngineProvider>        ← calls register() when plugins load
 *       <AppShell>
 *         <SlotOutlet name="…" />   ← renders registered components
 *       </AppShell>
 *     </PluginEngineProvider>
 *   </SlotRegistryProvider>
 */

import {
  createContext,
  useContext,
  useReducer,
  type ComponentType,
  type ReactNode,
} from "react";

// ── Slot names ───────────────────────────────────────────────────────────────

/**
 * The five named regions in AppShell where plugins can inject UI.
 *
 *   ┌────────────────────────────────────┐
 *   │            Header (48px)            │
 *   ├────────────┬───────────────────────┤
 *   │ sidebar-top│                        │
 *   │            │     main-panel         │
 *   │sidebar-bot │                        │
 *   ├────────────┴───────────────────────┤
 *   │          capture-bar (52px)         │
 *   ├────────────────────────────────────┤
 *   │          status-bar                 │
 *   └────────────────────────────────────┘
 */
export type SlotName =
  | "main-panel"
  | "sidebar-top"
  | "sidebar-bottom"
  | "capture-bar"
  | "status-bar";

// ── SlotEntry ────────────────────────────────────────────────────────────────

export interface SlotEntry {
  /**
   * Unique key within the slot.
   * Conventionally `"${pluginId}::${slotName}"`.
   */
  id: string;
  component: ComponentType;
  /**
   * Render order within the slot: higher values appear first.
   * Defaults to 0.
   */
  priority?: number;
}

// ── Registry context ─────────────────────────────────────────────────────────

interface SlotRegistryValue {
  register(slot: SlotName, entry: SlotEntry): void;
  unregister(slot: SlotName, id: string): void;
  getSlots(slot: SlotName): SlotEntry[];
}

type SlotMap = Map<SlotName, SlotEntry[]>;

type RegistryAction =
  | { type: "register"; slot: SlotName; entry: SlotEntry }
  | { type: "unregister"; slot: SlotName; id: string };

function registryReducer(state: SlotMap, action: RegistryAction): SlotMap {
  const next = new Map(state);

  if (action.type === "register") {
    const existing = next.get(action.slot) ?? [];
    // Replace if same id already present, then re-sort by descending priority.
    const updated = [
      ...existing.filter((e) => e.id !== action.entry.id),
      action.entry,
    ].sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
    next.set(action.slot, updated);
  } else {
    next.set(
      action.slot,
      (next.get(action.slot) ?? []).filter((e) => e.id !== action.id),
    );
  }

  return next;
}

const SlotRegistryContext = createContext<SlotRegistryValue | null>(null);

// ── Provider ─────────────────────────────────────────────────────────────────

/**
 * Mount at the top of the component tree (above both `<PluginEngineProvider>`
 * and `<AppShell>`) so that plugin engine and shell can both access the registry.
 */
export function SlotRegistryProvider({ children }: { children: ReactNode }) {
  const [slotMap, dispatch] = useReducer(registryReducer, new Map() as SlotMap);

  const value: SlotRegistryValue = {
    register(slot, entry) {
      dispatch({ type: "register", slot, entry });
    },
    unregister(slot, id) {
      dispatch({ type: "unregister", slot, id });
    },
    getSlots(slot) {
      return slotMap.get(slot) ?? [];
    },
  };

  return (
    <SlotRegistryContext.Provider value={value}>
      {children}
    </SlotRegistryContext.Provider>
  );
}

// ── Hook ─────────────────────────────────────────────────────────────────────

/** Access the slot registry from any component inside `<SlotRegistryProvider>`. */
export function useSlotRegistry(): SlotRegistryValue {
  const ctx = useContext(SlotRegistryContext);
  if (!ctx) {
    throw new Error(
      "useSlotRegistry must be used within <SlotRegistryProvider>",
    );
  }
  return ctx;
}

// ── SlotOutlet ───────────────────────────────────────────────────────────────

interface SlotOutletProps {
  /** Which named region to render. */
  name: SlotName;
  /** Optional className applied to the wrapper `<div>` when entries exist. */
  className?: string;
  /**
   * Rendered when no plugin components are registered for this slot.
   * If omitted the outlet renders nothing (returns `null`).
   */
  fallback?: ReactNode;
}

/**
 * Renders all plugin components registered for a named slot, in priority order.
 *
 * Each component is mounted independently — an error in one plugin component
 * will not prevent others from rendering (wrap individual entries in an
 * `<ErrorBoundary>` if stricter isolation is needed).
 */
export function SlotOutlet({ name, className, fallback }: SlotOutletProps) {
  const { getSlots } = useSlotRegistry();
  const entries = getSlots(name);

  if (entries.length === 0) {
    return fallback != null ? <>{fallback}</> : null;
  }

  return (
    <div className={className} data-slot={name}>
      {entries.map(({ id, component: Component }) => (
        <Component key={id} />
      ))}
    </div>
  );
}
