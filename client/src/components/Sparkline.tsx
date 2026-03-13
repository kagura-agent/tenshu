interface SparklineProps {
  values: number[];
  width?: number;
  height?: number;
  min?: number;
  max?: number;
}

export function Sparkline({ values, width = 60, height = 16, min = 0, max = 10 }: SparklineProps) {
  if (values.length < 2) return null;

  const range = max - min || 1;
  const padding = 2;
  const innerH = height - padding * 2;
  const step = (width - padding * 2) / (values.length - 1);

  const points = values.map((v, i) => {
    const x = padding + i * step;
    const y = padding + innerH - ((v - min) / range) * innerH;
    return `${x},${y}`;
  }).join(" ");

  // Trend color: compare last value to first
  const first = values[0];
  const last = values[values.length - 1];
  const color = last > first + 0.5 ? "#22c55e" : last < first - 0.5 ? "#ef4444" : "#71717a";

  return (
    <svg width={width} height={height} className="shrink-0">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Dot on last value */}
      <circle
        cx={padding + (values.length - 1) * step}
        cy={padding + innerH - ((last - min) / range) * innerH}
        r={2}
        fill={color}
      />
    </svg>
  );
}
