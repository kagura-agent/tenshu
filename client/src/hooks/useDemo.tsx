import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

interface DemoContextValue {
  isDemo: boolean;
}

const DemoContext = createContext<DemoContextValue>({ isDemo: false });

export function DemoProvider({ children }: { children: ReactNode }) {
  const [isDemo, setIsDemo] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("demo") === "true";
  });

  useEffect(() => {
    if (isDemo) return; // already in demo mode via URL param

    // Auto-detect: if server is unreachable, switch to demo mode
    const controller = new AbortController();
    fetch("/api/agents", { signal: controller.signal })
      .then((res) => {
        if (!res.ok) setIsDemo(true);
      })
      .catch(() => {
        setIsDemo(true);
      });

    return () => controller.abort();
  }, [isDemo]);

  return (
    <DemoContext.Provider value={{ isDemo }}>
      {children}
    </DemoContext.Provider>
  );
}

export function useDemo() {
  return useContext(DemoContext);
}
