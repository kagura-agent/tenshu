import { useQuery } from "@tanstack/react-query";
import type { ResultRow } from "@tenshu/shared";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const STATUS_COLORS: Record<ResultRow["status"], string> = {
  keep: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  discard: "bg-red-500/10 text-red-400 border-red-500/30",
  crash: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  skip: "bg-zinc-500/10 text-zinc-400 border-zinc-500/30",
};

function ScoreBar({ score }: { score: number }) {
  const pct = (score / 10) * 100;
  const color =
    score >= 8 ? "bg-emerald-500" : score >= 6 ? "bg-sky-500" : score >= 4 ? "bg-amber-500" : "bg-red-500";
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-2 bg-zinc-800 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-mono w-8">{score.toFixed(1)}</span>
    </div>
  );
}

export function Results() {
  const { data: rows = [], isLoading } = useQuery<ResultRow[]>({
    queryKey: ["results"],
    queryFn: () => fetch("/api/results").then((r) => r.json()),
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-zinc-400">Loading results...</p>
      </div>
    );
  }

  // Compute stats from coder rows (primary work unit)
  const coderRows = rows.filter((r) => r.agent === "coder");
  const kept = coderRows.filter((r) => r.status === "keep");
  const avgScore =
    coderRows.length > 0
      ? coderRows.reduce((sum, r) => sum + r.score, 0) / coderRows.length
      : 0;
  const recentScores = coderRows.slice(-10).map((r) => r.score);
  const successRate =
    coderRows.length > 0
      ? Math.round((kept.length / coderRows.length) * 100)
      : 0;

  // Reverse for newest-first display
  const displayRows = [...rows].reverse();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Results</h1>
        <p className="text-zinc-400 mt-1">
          Cycle experiment log — ratcheting keeps only improvements
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-4">
            <p className="text-xs text-zinc-500 uppercase tracking-wide">Total Cycles</p>
            <p className="text-2xl font-bold mt-1">{coderRows.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-4">
            <p className="text-xs text-zinc-500 uppercase tracking-wide">Kept</p>
            <p className="text-2xl font-bold mt-1 text-emerald-400">{kept.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-4">
            <p className="text-xs text-zinc-500 uppercase tracking-wide">Avg Score</p>
            <p className="text-2xl font-bold mt-1">{avgScore.toFixed(1)}</p>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-4">
            <p className="text-xs text-zinc-500 uppercase tracking-wide">Success Rate</p>
            <p className="text-2xl font-bold mt-1">{successRate}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Score trend (last 10) */}
      {recentScores.length > 0 && (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-4">
            <p className="text-xs text-zinc-500 uppercase tracking-wide mb-3">
              Recent Score Trend (last {recentScores.length})
            </p>
            <div className="flex items-end gap-1 h-16">
              {recentScores.map((score, i) => {
                const height = (score / 10) * 100;
                const color =
                  score >= 8
                    ? "bg-emerald-500"
                    : score >= 6
                      ? "bg-sky-500"
                      : score >= 4
                        ? "bg-amber-500"
                        : "bg-red-500";
                return (
                  <div
                    key={i}
                    className="flex-1 flex flex-col items-center gap-1"
                  >
                    <div
                      className={`w-full rounded-t ${color}`}
                      style={{ height: `${height}%` }}
                      title={`${score.toFixed(1)}/10`}
                    />
                    <span className="text-[10px] text-zinc-600">
                      {score.toFixed(1)}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results table */}
      {rows.length === 0 ? (
        <p className="text-zinc-500">
          No results yet. Run an orchestrator cycle to generate data.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
                <th className="text-left py-2 px-3">Time</th>
                <th className="text-left py-2 px-3">Cycle</th>
                <th className="text-left py-2 px-3">Task</th>
                <th className="text-left py-2 px-3">Agent</th>
                <th className="text-left py-2 px-3">Score</th>
                <th className="text-left py-2 px-3">Status</th>
                <th className="text-left py-2 px-3">Description</th>
              </tr>
            </thead>
            <tbody>
              {displayRows.map((row, i) => (
                <tr
                  key={i}
                  className="border-b border-zinc-800/50 hover:bg-zinc-900/50"
                >
                  <td className="py-2 px-3 text-zinc-500 text-xs font-mono whitespace-nowrap">
                    {new Date(row.timestamp).toLocaleString(undefined, {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="py-2 px-3 font-mono">#{row.cycle}</td>
                  <td className="py-2 px-3 text-zinc-300">{row.task}</td>
                  <td className="py-2 px-3 text-zinc-400">{row.agent}</td>
                  <td className="py-2 px-3">
                    <ScoreBar score={row.score} />
                  </td>
                  <td className="py-2 px-3">
                    <Badge
                      variant="outline"
                      className={`text-xs ${STATUS_COLORS[row.status]}`}
                    >
                      {row.status}
                    </Badge>
                  </td>
                  <td className="py-2 px-3 text-zinc-500 text-xs max-w-xs truncate">
                    {row.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
