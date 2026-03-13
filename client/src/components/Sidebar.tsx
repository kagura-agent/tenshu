import { NavLink } from "react-router-dom";
import { LayoutDashboard, Swords, Monitor, Clock, FlaskConical, Cpu, Activity } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import type { ThemeMode } from "@/hooks/useTheme";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/command", icon: Swords, label: "Command" },
  { to: "/sessions", icon: Monitor, label: "Sessions" },
  { to: "/cron", icon: Clock, label: "Cron Jobs" },
  { to: "/results", icon: FlaskConical, label: "Results" },
  { to: "/activity", icon: Activity, label: "Activity" },
  { to: "/system", icon: Cpu, label: "System" },
];

const THEME_CONFIG: Record<ThemeMode, { accent: string; bg: string; border: string; label: string }> = {
  warroom: { accent: "#f59e0b", bg: "#1a1410", border: "rgba(180, 140, 80, 0.15)", label: "作戦室" },
  deck: { accent: "#06b6d4", bg: "#08081a", border: "rgba(6, 182, 212, 0.15)", label: "指令台" },
};

export function Sidebar() {
  const { theme, setTheme } = useTheme();
  const config = THEME_CONFIG[theme];

  return (
    <aside
      className="w-56 flex flex-col h-screen transition-colors duration-500"
      style={{ background: config.bg, borderRight: `1px solid ${config.border}` }}
    >
      <div className="p-4 flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-md flex items-center justify-center text-white font-bold text-sm"
          style={{ backgroundColor: config.accent }}
        >
          天
        </div>
        <span className="text-zinc-100 font-bold text-lg">Tenshu</span>
      </div>

      {/* Theme toggle */}
      <div className="px-3 mb-3">
        <div className="flex gap-1 p-0.5 rounded-md" style={{ background: "rgba(255,255,255,0.05)" }}>
          <button
            onClick={() => setTheme("warroom")}
            className="flex-1 px-2 py-1 rounded text-[10px] font-medium transition-all"
            style={{
              background: theme === "warroom" ? `${config.accent}22` : "transparent",
              color: theme === "warroom" ? config.accent : "rgba(161, 161, 170, 0.6)",
              border: theme === "warroom" ? `1px solid ${config.accent}44` : "1px solid transparent",
            }}
          >
            作戦室 War Room
          </button>
          <button
            onClick={() => setTheme("deck")}
            className="flex-1 px-2 py-1 rounded text-[10px] font-medium transition-all"
            style={{
              background: theme === "deck" ? `${THEME_CONFIG.deck.accent}22` : "transparent",
              color: theme === "deck" ? THEME_CONFIG.deck.accent : "rgba(161, 161, 170, 0.6)",
              border: theme === "deck" ? `1px solid ${THEME_CONFIG.deck.accent}44` : "1px solid transparent",
            }}
          >
            指令台 Control Deck
          </button>
        </div>
      </div>

      <nav className="flex-1 px-2 py-2 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                isActive
                  ? ""
                  : "text-zinc-400 hover:text-zinc-100 hover:bg-white/5"
              }`
            }
            style={({ isActive }) =>
              isActive
                ? { background: `${config.accent}15`, color: config.accent }
                : {}
            }
          >
            <Icon className="w-4 h-4" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4" style={{ borderTop: `1px solid ${config.border}` }}>
        <div className="text-xs text-zinc-600">Tenshu v0.1.0</div>
      </div>
    </aside>
  );
}
