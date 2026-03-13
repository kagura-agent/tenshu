import { useState } from "react";
import type { Agent } from "@tenshu/shared";
import { useAgents } from "@/hooks/useAgents";
import { WarRoom } from "@/office2d/WarRoom";
import { ControlDeck } from "@/office2d/ControlDeck";
import AgentPanel from "@/office2d/AgentPanel";

type ViewMode = "warroom" | "deck";

export function Office() {
  const { agents, loading } = useAgents();
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [view, setView] = useState<ViewMode>("warroom");

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-zinc-400">
        Loading...
      </div>
    );
  }

  return (
    <div className="relative w-full h-full -m-6">
      {/* View toggle */}
      <div className="absolute top-4 left-4 z-20 flex gap-1 bg-zinc-900/80 backdrop-blur rounded-lg p-1 border border-zinc-700/50">
        <button
          onClick={() => setView("warroom")}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
            view === "warroom"
              ? "bg-[#ff6b35] text-white"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          作戦室 War Room
        </button>
        <button
          onClick={() => setView("deck")}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
            view === "deck"
              ? "bg-[#ff6b35] text-white"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          指令台 Control Deck
        </button>
      </div>

      {view === "warroom" ? (
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
