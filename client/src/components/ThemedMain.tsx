import type { ReactNode } from "react";
import { useTheme } from "@/hooks/useTheme";

const THEME_STYLES = {
  warroom: {
    background: "linear-gradient(135deg, #1a1410 0%, #1e1a10 50%, #1a1410 100%)",
    borderColor: "rgba(180, 140, 80, 0.08)",
  },
  deck: {
    background: "linear-gradient(135deg, #08081a 0%, #0c0c2e 50%, #08081a 100%)",
    borderColor: "rgba(6, 182, 212, 0.08)",
  },
};

export function ThemedMain({ children }: { children: ReactNode }) {
  const { theme } = useTheme();
  const styles = THEME_STYLES[theme];

  return (
    <main
      className="flex-1 overflow-auto p-6 transition-colors duration-500"
      style={{ background: styles.background }}
    >
      {children}
    </main>
  );
}
