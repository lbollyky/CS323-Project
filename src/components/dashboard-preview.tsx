import { Activity, Heart, Sparkles } from "lucide-react";

export function DashboardPreview() {
  return (
    <div className="relative mx-auto w-full max-w-5xl">
      {/* Soft floor reflection */}
      <div className="absolute inset-x-12 -bottom-8 h-32 rounded-full bg-foreground/10 blur-3xl" />

      {/* Tablet bezel */}
      <div className="relative overflow-hidden rounded-[36px] border border-foreground/10 bg-foreground p-3 shadow-2xl">
        <div className="overflow-hidden rounded-[24px] bg-[#0b0d12]">
          {/* App chrome */}
          <div className="flex items-center justify-between border-b border-white/5 px-6 py-4">
            <div>
              <p className="text-[12px] font-medium text-white/50">
                Hello, Alex.
              </p>
              <p className="text-[11px] text-white/35">Your health snapshot</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-blue-500/15 px-2.5 py-1 text-[10px] font-semibold text-blue-300">
                3 protocols active
              </span>
              <div className="h-7 w-7 rounded-full bg-gradient-to-br from-blue-400 to-violet-500" />
            </div>
          </div>

          {/* Main grid */}
          <div className="grid gap-3 p-4 sm:grid-cols-3">
            {/* Adherence chart */}
            <div className="sm:col-span-2 rounded-2xl bg-white/[0.04] p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-300/70">
                  Adherence — last 14 days
                </p>
                <p className="text-[11px] font-mono text-white/50">96%</p>
              </div>
              <div className="flex items-end gap-1.5">
                {ADHERENCE_BARS.map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-sm bg-gradient-to-t from-emerald-500 to-cyan-300"
                    style={{ height: `${h}px` }}
                  />
                ))}
              </div>
            </div>

            {/* Recovery score */}
            <div className="rounded-2xl bg-white/[0.04] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-white/50">
                Recovery score
              </p>
              <p className="mt-2 text-4xl font-bold text-white tabular-nums">
                82
              </p>
              <div className="mt-3 flex items-center gap-1 text-[11px] text-emerald-300">
                <Activity className="h-3 w-3" />
                +6 from last week
              </div>
            </div>

            {/* Today's protocol */}
            <div className="rounded-2xl bg-white/[0.04] p-4">
              <div className="mb-3 flex items-center gap-2">
                <Heart className="h-3.5 w-3.5 text-rose-300" />
                <p className="text-[11px] font-semibold uppercase tracking-wider text-white/60">
                  Today
                </p>
              </div>
              <ul className="space-y-2 text-[12px]">
                {[
                  ["BPC-157", "250 mcg · subQ"],
                  ["NMN", "500 mg · oral"],
                  ["Magnesium", "400 mg · evening"],
                ].map(([n, d]) => (
                  <li key={n} className="flex items-center justify-between">
                    <span className="text-white/85">{n}</span>
                    <span className="text-[10px] text-white/40">{d}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* In-range biomarkers */}
            <div className="rounded-2xl bg-white/[0.04] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-white/50">
                Biomarkers
              </p>
              <div className="mt-3 flex items-center gap-3">
                <RingChart percent={74} />
                <div>
                  <p className="text-[18px] font-semibold text-white">
                    74%{" "}
                    <span className="text-[11px] font-normal text-white/50">
                      in range
                    </span>
                  </p>
                  <p className="text-[10px] text-white/40">
                    23 of 31 markers
                  </p>
                </div>
              </div>
            </div>

            {/* Care team msg */}
            <div className="sm:col-span-1 rounded-2xl bg-white/[0.04] p-4">
              <div className="mb-2 flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-gradient-to-br from-amber-300 to-rose-400" />
                <p className="text-[11px] font-semibold text-white">
                  Dr. Patel
                </p>
              </div>
              <p className="text-[11.5px] leading-relaxed text-white/70">
                &ldquo;Recovery trending up. Hold dose for 2 weeks before
                we re-test cortisol.&rdquo;
              </p>
            </div>
          </div>

          {/* Footer banner */}
          <div className="m-4 mt-0 flex items-center justify-between rounded-2xl bg-gradient-to-r from-blue-600/30 via-violet-600/20 to-blue-600/30 px-4 py-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-blue-300" />
              <p className="text-[11.5px] font-medium text-white">
                Next shipment in 6 days
              </p>
            </div>
            <button
              type="button"
              className="rounded-full bg-white px-3 py-1 text-[10.5px] font-semibold text-foreground"
            >
              Manage
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const ADHERENCE_BARS = [
  20, 28, 36, 32, 38, 30, 42, 48, 36, 28, 44, 40, 50, 46,
];

function RingChart({ percent }: { percent: number }) {
  const r = 14;
  const c = 2 * Math.PI * r;
  const offset = c - (percent / 100) * c;
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden>
      <circle
        cx="20"
        cy="20"
        r={r}
        fill="none"
        stroke="rgba(255,255,255,0.1)"
        strokeWidth="3"
      />
      <circle
        cx="20"
        cy="20"
        r={r}
        fill="none"
        stroke="url(#ringg)"
        strokeWidth="3"
        strokeDasharray={c}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 20 20)"
      />
      <defs>
        <linearGradient id="ringg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#a78bfa" />
        </linearGradient>
      </defs>
    </svg>
  );
}
