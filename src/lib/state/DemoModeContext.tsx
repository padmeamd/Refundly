import { createContext, useContext, useMemo, useState } from "react";
import { getDemoModeEnabled, setDemoModeEnabled } from "@/lib/demo-mode";

interface DemoModeContextValue {
  demoMode: boolean;
  toggleDemoMode: () => void;
  setDemoMode: (next: boolean) => void;
}

const DemoModeContext = createContext<DemoModeContextValue | null>(null);

export function DemoModeProvider({ children }: { children: React.ReactNode }) {
  const [demoMode, setDemoModeState] = useState<boolean>(() => getDemoModeEnabled());

  const setDemoMode = (next: boolean) => {
    setDemoModeState(next);
    setDemoModeEnabled(next);
  };

  const toggleDemoMode = () => {
    const next = !demoMode;
    setDemoMode(next);
  };

  const value = useMemo(
    () => ({
      demoMode,
      toggleDemoMode,
      setDemoMode,
    }),
    [demoMode],
  );

  return <DemoModeContext.Provider value={value}>{children}</DemoModeContext.Provider>;
}

export function useDemoMode(): DemoModeContextValue {
  const context = useContext(DemoModeContext);
  if (!context) {
    throw new Error("useDemoMode must be used within DemoModeProvider");
  }
  return context;
}
