import type { PluginDefinition } from "../lib/plugin-loader";
import { FocusTimer } from "./focus-session/FocusTimer";

export const focusSessionPlugin: PluginDefinition = {
  id: "app.lifecopilot.focus-session",
  name: "Focus Session",
  version: "1.0.0",

  slots: [{ slot: "status-bar", component: FocusTimer, priority: 100 }],

  activate(_ctx) {
    // Timer is fully self-contained in the component.
  },
};
