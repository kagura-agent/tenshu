import { useAgents } from "@/hooks/useAgents";
import { AgentCard } from "@/components/AgentCard";
import { ActivityFeed } from "@/components/ActivityFeed";
import { Card, CardContent } from "@/components/ui/card";

export function Dashboard() {
  const { agents, loading, connected } = useAgents();

  const activeCount = agents.filter(
    (a) => a.state.status === "working" || a.state.status === "thinking"
  ).length;

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
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-zinc-400 mt-1">Monitor your AI agent team</p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div
            className={`w-2 h-2 rounded-full ${connected ? "bg-emerald-500" : "bg-zinc-600"}`}
          />
          <span className="text-zinc-400">
            {connected ? "Connected" : "Disconnected"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-4">
            <p className="text-xs text-zinc-500 uppercase">Agents</p>
            <p className="text-2xl font-bold text-emerald-500">
              {activeCount}/{agents.length}
            </p>
            <p className="text-xs text-zinc-500">active</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-4">
            <p className="text-xs text-zinc-500 uppercase">System</p>
            <p className="text-2xl font-bold text-zinc-100">
              {agents.length > 0 ? "Online" : "No agents"}
            </p>
            <p className="text-xs text-zinc-500">
              {agents.length} configured
            </p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-4">
            <p className="text-xs text-zinc-500 uppercase">WebSocket</p>
            <p className={`text-2xl font-bold ${connected ? "text-emerald-500" : "text-zinc-600"}`}>
              {connected ? "Live" : "Offline"}
            </p>
            <p className="text-xs text-zinc-500">real-time feed</p>
          </CardContent>
        </Card>
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
