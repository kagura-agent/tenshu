import { useQuery } from "@tanstack/react-query";
import type { SystemResources } from "@tenshu/shared";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

function UsageBar({
  used,
  total,
  unit,
  color = "bg-sky-500",
  warnAt = 80,
  dangerAt = 90,
}: {
  used: number;
  total: number;
  unit: string;
  color?: string;
  warnAt?: number;
  dangerAt?: number;
}) {
  const pct = total > 0 ? (used / total) * 100 : 0;
  const barColor =
    pct >= dangerAt ? "bg-red-500" : pct >= warnAt ? "bg-amber-500" : color;
  return (
    <div>
      <div className="flex justify-between text-xs text-zinc-500 mb-1">
        <span>
          {used.toLocaleString()} / {total.toLocaleString()} {unit}
        </span>
        <span>{Math.round(pct)}%</span>
      </div>
      <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${barColor}`}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
    </div>
  );
}

function TempDisplay({ tempC }: { tempC: number }) {
  const color =
    tempC >= 85 ? "text-red-400" : tempC >= 70 ? "text-amber-400" : "text-emerald-400";
  return <span className={`text-3xl font-bold ${color}`}>{tempC}°C</span>;
}

export function System() {
  const { data: sys, isLoading } = useQuery<SystemResources>({
    queryKey: ["system"],
    queryFn: () => fetch("/api/system").then((r) => r.json()),
    refetchInterval: 5000,
  });

  if (isLoading || !sys) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-zinc-400">Loading system info...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">System</h1>
          <p className="text-zinc-400 mt-1">
            Hardware resources and model status
          </p>
        </div>
        <Badge variant="outline" className="text-xs text-zinc-400">
          Uptime: {sys.uptime}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* GPU */}
        {sys.gpu && (
          <Card className="bg-zinc-900 border-zinc-800 col-span-2">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-wide">
                    GPU
                  </p>
                  <p className="text-sm text-zinc-300 mt-0.5">{sys.gpu.name}</p>
                </div>
                <div className="flex items-center gap-4">
                  <TempDisplay tempC={sys.gpu.tempC} />
                  <div className="text-right">
                    <p className="text-xs text-zinc-500">Power</p>
                    <p className="text-sm font-mono">
                      {sys.gpu.powerW}W / {sys.gpu.powerCapW}W
                    </p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-zinc-500 mb-1">Utilization</p>
                  <UsageBar
                    used={sys.gpu.utilPercent}
                    total={100}
                    unit="%"
                    color="bg-violet-500"
                  />
                </div>
                <div>
                  <p className="text-xs text-zinc-500 mb-1">VRAM</p>
                  <UsageBar
                    used={sys.gpu.memUsedMB}
                    total={sys.gpu.memTotalMB}
                    unit="MB"
                    color="bg-violet-500"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* CPU */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-4">
            <p className="text-xs text-zinc-500 uppercase tracking-wide">CPU</p>
            <p className="text-sm text-zinc-400 mt-0.5 mb-3">
              {sys.cpu.cores} cores
            </p>
            <UsageBar
              used={sys.cpu.usagePercent}
              total={100}
              unit="%"
              color="bg-sky-500"
            />
          </CardContent>
        </Card>

        {/* Memory */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-4">
            <p className="text-xs text-zinc-500 uppercase tracking-wide">
              Memory
            </p>
            <p className="text-sm text-zinc-400 mt-0.5 mb-3">System RAM</p>
            <UsageBar
              used={sys.memory.usedMB}
              total={sys.memory.totalMB}
              unit="MB"
              color="bg-emerald-500"
            />
          </CardContent>
        </Card>

        {/* Disk */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-4">
            <p className="text-xs text-zinc-500 uppercase tracking-wide">
              Disk ({sys.disk.path})
            </p>
            <div className="mt-3">
              <UsageBar
                used={sys.disk.usedGB}
                total={sys.disk.totalGB}
                unit="GB"
                color="bg-amber-500"
              />
            </div>
          </CardContent>
        </Card>

        {/* Loaded Models */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-4">
            <p className="text-xs text-zinc-500 uppercase tracking-wide">
              Loaded Models
            </p>
            <div className="mt-3 space-y-2">
              {sys.loadedModels.length === 0 ? (
                <p className="text-sm text-zinc-500">No models loaded</p>
              ) : (
                sys.loadedModels.map((m) => (
                  <div
                    key={m.name}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm text-zinc-300 font-mono">
                      {m.name}
                    </span>
                    <Badge
                      variant="outline"
                      className="text-xs text-violet-400 border-violet-500/30"
                    >
                      {m.sizeGB}GB
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
