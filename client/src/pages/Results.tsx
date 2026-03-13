import { useQuery } from "@tanstack/react-query";
import type { ResultRow } from "@tenshu/shared";
import { ThemedPageHeader } from "@/components/ThemedPageHeader";
import { ThemedCard } from "@/components/ThemedCard";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/hooks/useTheme";
import { useDemo } from "@/hooks/useDemo";
import { useMockResults } from "@/hooks/useMockData";

const STATUS_COLORS: Record<ResultRow["status"], string> = {
  keep: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  discard: "bg-red-500/10 text-red-400 border-red-500/30",
  crash: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  skip: "bg-zinc-500/10 text-zinc-400 border-zinc-500/30",
};

function ScoreBar({ score, accent }: { score: number; accent: string }) {
  const pct = (score / 10) * 100;
  const color =
    score >= 8 ? "#10b981" : score >= 6 ? accent : score >= 4 ? "#f59e0b" : "#ef4444";
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className="text-xs font-mono w-8">{score.toFixed(1)}</span>
    </div>
  );
}

export function Results() {
  const { theme } = useTheme();
  const accent = theme === "warroom" ? "#f59e0b" : theme === "deck" ? "#06b6d4" : "#f472b6";
  const { isDemo } = useDemo();
  const mock = useMockResults();

  const { data: realRows = [], isLoading: realLoading } = useQuery<ResultRow[]>({
    queryKey: ["results"],
    queryFn: () => fetch("/api/results").then((r) => r.json()),
    refetchInterval: 30000,
    enabled: !isDemo,
  });

  const rows = isDemo ? mock.data : realRows;
  const isLoading = isDemo ? false : realLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-zinc-400">Loading results...</p>
      </div>
    );
  }

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

  const displayRows = [...rows].reverse();

  return (
    <div className="space-y-6">
      <ThemedPageHeader kanji="戦績" title="BATTLE RECORD" />

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-4">
        <ThemedCard>
          <p className="text-xs text-zinc-500 uppercase tracking-wider">Total Cycles</p>
          <p className="text-2xl font-bold mt-1">{coderRows.length}</p>
        </ThemedCard>
        <ThemedCard>
          <p className="text-xs text-zinc-500 uppercase tracking-wider">Kept</p>
          <p className="text-2xl font-bold mt-1" style={{ color: accent }}>{kept.length}</p>
        </ThemedCard>
        <ThemedCard>
          <p className="text-xs text-zinc-500 uppercase tracking-wider">Avg Score</p>
          <p className="text-2xl font-bold mt-1">{avgScore.toFixed(1)}</p>
        </ThemedCard>
        <ThemedCard>
          <p className="text-xs text-zinc-500 uppercase tracking-wider">Success Rate</p>
          <p className="text-2xl font-bold mt-1">{successRate}%</p>
        </ThemedCard>
      </div>

      {/* Score trend (last 10) */}
      {recentScores.length > 0 && (
        <ThemedCard glow>
          <p className="text-xs text-zinc-500 uppercase tracking-wide mb-3">
            Recent Score Trend (last {recentScores.length})
          </p>
          <div className="flex items-end gap-1 h-16">
            {recentScores.map((score, i) => {
              const height = (score / 10) * 100;
              const barColor =
                score >= 8 ? "#10b981" : score >= 6 ? accent : score >= 4 ? "#f59e0b" : "#ef4444";
              return (
                <div
                  key={i}
                  className="flex-1 flex flex-col items-center gap-1"
                >
                  <div
                    className="w-full rounded-t"
                    style={{ height: `${height}%`, backgroundColor: barColor }}
                    title={`${score.toFixed(1)}/10`}
                  />
                  <span className="text-[10px] text-zinc-600">
                    {score.toFixed(1)}
                  </span>
                </div>
              );
            })}
          </div>
        </ThemedCard>
      )}

      {/* Results table */}
      {rows.length === 0 ? (
        <p className="text-zinc-500">
          No results yet. Run an orchestrator cycle to generate data.
        </p>
      ) : (
        <ThemedCard className="!p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-zinc-500 text-xs uppercase tracking-wide" style={{ borderColor: `${accent}22` }}>
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
                  className="border-b hover:bg-white/[0.02]"
                  style={{ borderColor: `${accent}11` }}
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
                    <ScoreBar score={row.score} accent={accent} />
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
        </ThemedCard>
      )}
    </div>
  );
}
