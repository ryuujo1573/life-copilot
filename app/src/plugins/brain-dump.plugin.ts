/**
 * Brain Dump Inbox — plugin for issue #11.
 *
 * Responsibilities:
 * - Listens to `capture:submit` events and saves tasks to the inbox
 *   (tasks with no list_id) via `task_create`.
 * - Registers a `main-panel` component that renders the inbox task list.
 * - Registers a `sidebar-top` nav entry.
 */

import type { PluginDefinition } from "../lib/plugin-loader";
import { BrainDumpSidebarNav } from "./brain-dump/BrainDumpSidebarNav";
import { BrainDumpPanel } from "./brain-dump/BrainDumpPanel";

export const brainDumpPlugin: PluginDefinition = {
  id: "app.lifecopilot.brain-dump",
  name: "Brain Dump",
  version: "1.0.0",

  slots: [
    { slot: "sidebar-top", component: BrainDumpSidebarNav, priority: 100 },
    { slot: "main-panel", component: BrainDumpPanel, priority: 100 },
  ],

  activate(ctx) {
    // Subscribe: every capture:submit creates an inbox task
    ctx.events.subscribe("capture:submit", async ({ text }) => {
      const id = crypto.randomUUID();
      try {
        await ctx.invoke("task_create", {
          payload: { id, title: text },
        });
        // Notify the panel to refresh
        ctx.events.emit("task:created", { id, title: text });
      } catch (err) {
        console.error("[BrainDump] task_create failed:", err);
      }
    });
  },
};
