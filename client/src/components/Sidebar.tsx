import { NavLink } from "react-router-dom";
import { LayoutDashboard, Building2, Monitor, Clock, FlaskConical, Cpu } from "lucide-react";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/office", icon: Building2, label: "Office" },
  { to: "/sessions", icon: Monitor, label: "Sessions" },
  { to: "/cron", icon: Clock, label: "Cron Jobs" },
  { to: "/results", icon: FlaskConical, label: "Results" },
  { to: "/system", icon: Cpu, label: "System" },
];

export function Sidebar() {
  return (
    <aside className="w-56 bg-zinc-950 border-r border-zinc-800 flex flex-col h-screen">
      <div className="p-4 flex items-center gap-3">
        <div className="w-8 h-8 bg-[#ff6b35] rounded-md flex items-center justify-center text-white font-bold text-sm">
          天
        </div>
        <span className="text-zinc-100 font-bold text-lg">Tenshu</span>
      </div>

      <nav className="flex-1 px-2 py-4 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                isActive
                  ? "bg-[#ff6b35]/10 text-[#ff6b35]"
                  : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900"
              }`
            }
          >
            <Icon className="w-4 h-4" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-zinc-800">
        <div className="text-xs text-zinc-600">Tenshu v0.1.0</div>
      </div>
    </aside>
  );
}
