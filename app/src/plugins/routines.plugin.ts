import type { PluginDefinition } from "../lib/plugin-loader";
import { RoutinesSidebarNav } from "./routines/RoutinesSidebarNav";
import { RoutinesPanel } from "./routines/RoutinesPanel";

export const routinesPlugin: PluginDefinition = {
  id: "app.lifecopilot.routines",
  name: "Routines",
  version: "1.0.0",

  slots: [
    { slot: "sidebar-top", component: RoutinesSidebarNav, priority: 80 },
    { slot: "main-panel", component: RoutinesPanel, priority: 80 },
  ],

  activate(_ctx) {
    // No background work for M4.
  },
};
