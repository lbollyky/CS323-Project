import type { DailyLog } from "@/types/track";

type ScoreField = keyof Pick<
  DailyLog,
  "sleep_score" | "energy_score" | "focus_score" | "mood_score"
>;

const METRICS: Array<{ field: ScoreField; label: string; color: string }> = [
  { field: "sleep_score", label: "Sleep", color: "oklch(0.55 0.18 280)" },
  { field: "energy_score", label: "Energy", color: "oklch(0.62 0.17 40)" },
  { field: "focus_score", label: "Focus", color: "oklch(0.55 0.15 215)" },
  { field: "mood_score", label: "Mood", color: "oklch(0.52 0.13 158)" },
];

// viewBox geometry. The SVG scales to the column width via CSS while
// keeping this aspect ratio, so strokes and dots stay crisp and round.
const W = 640;
const H = 248;
const PAD_L = 26;
const PAD_R = 14;
const PAD_T = 14;
const PAD_B = 26;
const PLOT_W = W - PAD_L - PAD_R;
const PLOT_H = H - PAD_T - PAD_B;

function yForScore(score: number): number {
  // score 1 → bottom, 10 → top
  return PAD_T + (1 - (score - 1) / 9) * PLOT_H;
}

function xForIndex(i: number, n: number): number {
  if (n <= 1) return PAD_L + PLOT_W / 2;
  return PAD_L + (i / (n - 1)) * PLOT_W;
}

interface Pt {
  x: number;
  y: number;
}

/** Catmull-Rom → cubic-Bézier smoothing for a clean, non-jagged line. */
function smoothPath(points: Pt[]): string {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
  }
  return d;
}

function fmtDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function TrackTrendChart({ logs }: { logs: DailyLog[] }) {
  // Page passes logs newest-first; chart reads left→right oldest→newest.
  const series = [...logs].reverse();
  if (series.length < 2) return null;

  const n = series.length;

  const lines = METRICS.map((m) => {
    const points: Pt[] = [];
    series.forEach((log, i) => {
      const v = log[m.field];
      if (typeof v === "number" && Number.isFinite(v)) {
        points.push({ x: xForIndex(i, n), y: yForScore(v) });
      }
    });
    const latest = [...series]
      .reverse()
      .map((l) => l[m.field])
      .find((v): v is number => typeof v === "number" && Number.isFinite(v));
    return { ...m, points, latest: latest ?? null };
  });

  const gridScores = [2, 4, 6, 8, 10];
  const firstDate = fmtDate(series[0].log_date);
  const lastDate = fmtDate(series[n - 1].log_date);

  return (
    <div className="rounded-2xl border border-border bg-background p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground">
          Scores over time
        </p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          {lines.map((l) => (
            <span
              key={l.field}
              className="inline-flex items-center gap-1.5 text-[11.5px] text-muted-foreground"
            >
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ background: l.color }}
              />
              {l.label}
              {l.latest != null && (
                <span className="tabular-nums text-foreground/70">
                  {l.latest}
                </span>
              )}
            </span>
          ))}
        </div>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="mt-4 h-auto w-full"
        role="img"
        aria-label="Line chart of sleep, energy, focus, and mood scores over the logged period"
      >
        {/* Horizontal gridlines + y labels */}
        {gridScores.map((s) => {
          const y = yForScore(s);
          return (
            <g key={s}>
              <line
                x1={PAD_L}
                y1={y}
                x2={W - PAD_R}
                y2={y}
                stroke="oklch(0.16 0.015 250 / 0.08)"
                strokeWidth="1"
              />
              <text
                x={PAD_L - 8}
                y={y + 3}
                textAnchor="end"
                className="fill-muted-foreground"
                fontSize="9"
                fontFamily="var(--font-mono)"
              >
                {s}
              </text>
            </g>
          );
        })}

        {/* Metric lines */}
        {lines.map((l) => (
          <path
            key={l.field}
            d={smoothPath(l.points)}
            fill="none"
            stroke={l.color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}

        {/* Latest-point dots */}
        {lines.map((l) => {
          const last = l.points[l.points.length - 1];
          if (!last) return null;
          return (
            <circle
              key={l.field}
              cx={last.x}
              cy={last.y}
              r="3"
              fill={l.color}
              stroke="var(--background)"
              strokeWidth="1.5"
            />
          );
        })}

        {/* X-axis end labels */}
        <text
          x={PAD_L}
          y={H - 8}
          textAnchor="start"
          className="fill-muted-foreground"
          fontSize="9"
          fontFamily="var(--font-mono)"
        >
          {firstDate}
        </text>
        <text
          x={W - PAD_R}
          y={H - 8}
          textAnchor="end"
          className="fill-muted-foreground"
          fontSize="9"
          fontFamily="var(--font-mono)"
        >
          {lastDate}
        </text>
      </svg>
    </div>
  );
}
