import type { ReactNode } from "react";
import { useTheme } from "@/hooks/useTheme";
import { AnimatedCanvas } from "@/office2d/AnimatedCanvas";
import { useLocation } from "react-router-dom";

const THEME_STYLES = {
  warroom: {
    background: "linear-gradient(135deg, #1a1410 0%, #1e1a10 50%, #1a1410 100%)",
    borderColor: "rgba(180, 140, 80, 0.08)",
  },
  deck: {
    background: "linear-gradient(135deg, #08081a 0%, #0c0c2e 50%, #08081a 100%)",
    borderColor: "rgba(6, 182, 212, 0.08)",
  },
  garden: {
    background: "linear-gradient(135deg, #1a1018 0%, #1e1420 50%, #1a1018 100%)",
    borderColor: "rgba(244, 114, 182, 0.08)",
  },
};

export function ThemedMain({ children }: { children: ReactNode }) {
  const { theme } = useTheme();
  const styles = THEME_STYLES[theme];
  const location = useLocation();
  // Command page has its own full particles — skip ambient here
  const isCommand = location.pathname === "/command";

  return (
    <main
      className="flex-1 overflow-auto p-6 transition-colors duration-500 relative"
      style={{ background: styles.background }}
    >
      {!isCommand && (
        <AnimatedCanvas theme={theme} intensity={0.15} />
      )}
      <div className="relative z-10 h-full">
        {children}
      </div>
    </main>
  );
}
