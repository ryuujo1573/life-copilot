import { useEffect } from "react";
import { SlotRegistryProvider } from "./lib/slot-registry";
import { PluginEngineProvider, usePluginEngine } from "./lib/plugin-engine";
import { AppShell } from "./components/AppShell";
import { brainDumpPlugin } from "./plugins/brain-dump.plugin";
import { todoBoardPlugin } from "./plugins/todo-board.plugin";
import { routinesPlugin } from "./plugins/routines.plugin";
import { focusSessionPlugin } from "./plugins/focus-session.plugin";

function PluginBootstrap() {
  const engine = usePluginEngine();

  useEffect(() => {
    void (async () => {
      await engine.load(brainDumpPlugin);
      await engine.load(todoBoardPlugin);
      await engine.load(routinesPlugin);
      await engine.load(focusSessionPlugin);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}

export default function App() {
  return (
    <SlotRegistryProvider>
      <PluginEngineProvider>
        <PluginBootstrap />
        <AppShell />
      </PluginEngineProvider>
    </SlotRegistryProvider>
  );
}
