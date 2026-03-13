import { useAgents } from "@/hooks/useAgents";
import { AgentCard } from "@/components/AgentCard";
import { ActivityFeed } from "@/components/ActivityFeed";
import { ThemedPageHeader } from "@/components/ThemedPageHeader";
import { ThemedCard } from "@/components/ThemedCard";
import { useTheme } from "@/hooks/useTheme";

export function Dashboard() {
  const { agents, loading, connected } = useAgents();
  const { theme } = useTheme();

  const activeCount = agents.filter(
    (a) => a.state.status === "working" || a.state.status === "thinking"
  ).length;

  const accent = theme === "warroom" ? "#f59e0b" : theme === "deck" ? "#06b6d4" : "#f472b6";

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-zinc-400">Loading agents...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <ThemedPageHeader kanji="総覧" title="OVERVIEW" />
        <div className="flex items-center gap-2 text-sm">
          <div
            className={`w-2 h-2 rounded-full ${connected ? "animate-pulse" : ""}`}
            style={{ backgroundColor: connected ? accent : "#52525b" }}
          />
          <span className="text-zinc-400">
            {connected ? "Connected" : "Disconnected"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <ThemedCard>
          <p className="text-xs text-zinc-500 uppercase tracking-wider">Agents</p>
          <p className="text-2xl font-bold" style={{ color: accent }}>
            {activeCount}/{agents.length}
          </p>
          <p className="text-xs text-zinc-500">active</p>
        </ThemedCard>

        <ThemedCard>
          <p className="text-xs text-zinc-500 uppercase tracking-wider">System</p>
          <p className="text-2xl font-bold text-zinc-100">
            {agents.length > 0 ? "Online" : "No agents"}
          </p>
          <p className="text-xs text-zinc-500">
            {agents.length} configured
          </p>
        </ThemedCard>

        <ThemedCard>
          <p className="text-xs text-zinc-500 uppercase tracking-wider">WebSocket</p>
          <p className="text-2xl font-bold" style={{ color: connected ? accent : "#52525b" }}>
            {connected ? "Live" : "Offline"}
          </p>
          <p className="text-xs text-zinc-500">real-time feed</p>
        </ThemedCard>
      </div>

      <div className="grid grid-cols-3 gap-6" style={{ minHeight: "400px" }}>
        <div className="col-span-2 space-y-3">
          {agents.map((agent) => (
            <AgentCard key={agent.config.id} agent={agent} />
          ))}
          {agents.length === 0 && (
            <p className="text-zinc-500">No agents configured in openclaw.json</p>
          )}
        </div>
        <div className="col-span-1">
          <ActivityFeed />
        </div>
      </div>
    </div>
  );
}
