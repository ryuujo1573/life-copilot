import type { PluginDefinition } from "../lib/plugin-loader";
import { TodoBoardSidebarNav } from "./todo-board/TodoBoardSidebarNav";
import { TodoBoardPanel } from "./todo-board/TodoBoardPanel";

export const todoBoardPlugin: PluginDefinition = {
  id: "app.lifecopilot.todo-board",
  name: "Todo Board",
  version: "1.0.0",

  slots: [
    { slot: "sidebar-top", component: TodoBoardSidebarNav, priority: 90 },
    { slot: "main-panel", component: TodoBoardPanel, priority: 90 },
  ],

  activate(_ctx) {
    // No background subscriptions needed — the panel is self-contained.
  },
};
