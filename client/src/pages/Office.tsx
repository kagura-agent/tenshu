import { useState } from "react";
import type { Agent } from "@tenshu/shared";
import { useAgents } from "@/hooks/useAgents";
import { useTheme } from "@/hooks/useTheme";
import { WarRoom } from "@/office2d/WarRoom";
import { ControlDeck } from "@/office2d/ControlDeck";
import AgentPanel from "@/office2d/AgentPanel";

export function Office() {
  const { agents, loading } = useAgents();
  const { theme } = useTheme();
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-zinc-400">
        Loading...
      </div>
    );
  }

  return (
    <div className="relative w-full h-full -m-6">
      {theme === "warroom" ? (
        <WarRoom agents={agents} onSelectAgent={setSelectedAgent} selectedAgentId={selectedAgent?.config.id ?? null} />
      ) : (
        <ControlDeck agents={agents} onSelectAgent={setSelectedAgent} selectedAgentId={selectedAgent?.config.id ?? null} />
      )}

      {selectedAgent && (
        <AgentPanel
          agent={selectedAgent}
          onClose={() => setSelectedAgent(null)}
        />
      )}
    </div>
  );
}
