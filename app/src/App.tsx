import { SlotRegistryProvider } from "./lib/slot-registry";
import { PluginEngineProvider } from "./lib/plugin-engine";
import { AppShell } from "./components/AppShell";

export default function App() {
  return (
    <SlotRegistryProvider>
      <PluginEngineProvider>
        <AppShell />
      </PluginEngineProvider>
    </SlotRegistryProvider>
  );
}
