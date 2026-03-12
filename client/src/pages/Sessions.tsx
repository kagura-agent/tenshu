import { useQuery } from "@tanstack/react-query";
import type { Session } from "@tenshu/shared";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function Sessions() {
  const { data: sessions = [], isLoading } = useQuery<Session[]>({
    queryKey: ["sessions"],
    queryFn: () => fetch("/api/sessions").then((r) => r.json()),
    refetchInterval: 10000,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-zinc-400">Loading sessions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Sessions</h1>
        <p className="text-zinc-400 mt-1">Active Claude Code sessions across agents</p>
      </div>

      {sessions.length === 0 ? (
        <p className="text-zinc-500">No active sessions</p>
      ) : (
        <div className="grid gap-4">
          {sessions.map((session) => (
            <Card key={session.id} className="bg-zinc-900 border-zinc-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-zinc-100">
                      {session.agentId}
                    </span>
                    {session.label && (
                      <span className="text-sm text-zinc-400">{session.label}</span>
                    )}
                    <Badge variant="outline" className="text-xs">
                      {session.model}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-zinc-100">
                      ${session.cost.toFixed(4)}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {session.totalTokens.toLocaleString()} tokens
                    </p>
                  </div>
                </div>
                <div className="flex gap-4 mt-3 text-xs text-zinc-500">
                  <span>In: {session.inputTokens.toLocaleString()}</span>
                  <span>Out: {session.outputTokens.toLocaleString()}</span>
                  <span>
                    Started: {new Date(session.startedAt).toLocaleTimeString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
