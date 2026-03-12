import { useState } from "react";
import type { Agent } from "@tenshu/shared";
import { useAgents } from "@/hooks/useAgents";
import Scene from "@/office3d/Scene";
import AgentPanel from "@/office3d/AgentPanel";

export function Office() {
  const { agents, loading } = useAgents();
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-zinc-400">
        Loading 3D office...
      </div>
    );
  }

  return (
    <div className="relative w-full h-full -m-6">
      <Scene
        agents={agents}
        selectedAgentId={selectedAgent?.config.id ?? null}
        onSelectAgent={setSelectedAgent}
      />
      {selectedAgent && (
        <AgentPanel
          agent={selectedAgent}
          onClose={() => setSelectedAgent(null)}
        />
      )}
    </div>
  );
}
