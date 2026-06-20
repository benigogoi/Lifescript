import type { DailyBucket } from "@/lib/dashboard-stats";

/** Pure server-rendered SVG bar chart — no client JS, no chart dependency. */
export function RevenueChart({ data }: { data: DailyBucket[] }) {
  const width = 720;
  const height = 200;
  const padding = 28;
  const max = Math.max(1, ...data.map((d) => d.revenueInr));
  const barGap = 6;
  const barWidth = (width - padding * 2) / data.length - barGap;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height} role="img" aria-label="Revenue, last 14 days">
      <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="var(--line)" />
      {data.map((d, i) => {
        const barHeight = ((height - padding * 2) * d.revenueInr) / max;
        const x = padding + i * (barWidth + barGap);
        const y = height - padding - barHeight;
        const label = new Date(d.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
        return (
          <g key={d.date}>
            <rect
              x={x}
              y={y}
              width={Math.max(barWidth, 1)}
              height={Math.max(barHeight, d.revenueInr > 0 ? 2 : 0)}
              rx={2}
              fill={d.revenueInr > 0 ? "var(--gold-bright)" : "rgba(255,255,255,0.06)"}
            >
              <title>{`${label}: ₹${d.revenueInr} (${d.orders} order${d.orders === 1 ? "" : "s"})`}</title>
            </rect>
            {i % 2 === 0 && (
              <text x={x + barWidth / 2} y={height - 10} fontSize="9" fill="var(--muted)" textAnchor="middle">
                {label}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
