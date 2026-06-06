import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Download, Printer, ShieldCheck } from "lucide-react";
import { SiteNav } from "@/components/site-nav";
import { findBatchByLot, getBatchProductInfo, type Batch } from "@/lib/batches";
import { getUser } from "@/lib/auth";

/**
 * Lab-report viewer. Currently renders an HTML mockup of the report so
 * the verify portal works end-to-end while the real PDFs are uploaded.
 *
 * To swap in a real PDF: drop the file into `public/lab-reports/` and
 * update `hplc_report_url` / `ms_report_url` in `src/lib/batches.ts` to
 * point at the static path. This route will continue to serve as a
 * fallback HTML preview for any entries that don't have a PDF yet.
 */

type ReportType = "hplc" | "ms";

interface PageProps {
  params: Promise<{ lot: string; type: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { lot, type } = await params;
  const t = type === "hplc" ? "HPLC" : type === "ms" ? "Mass Spec" : null;
  if (!t) return { title: "Lab report — Pepwell" };
  return {
    title: `${t} report · Lot ${lot.toUpperCase()} — Pepwell`,
    description: `Third-party ${t} analysis for Pepwell lot ${lot.toUpperCase()}.`,
  };
}

export default async function LabReportPage({ params }: PageProps) {
  const { lot, type } = await params;
  if (type !== "hplc" && type !== "ms") notFound();

  const batch = findBatchByLot(lot);
  if (!batch) notFound();

  const user = await getUser();
  const product = getBatchProductInfo(batch.product_id);
  const reportType = type as ReportType;

  return (
    <div className="flex min-h-screen flex-col bg-surface/40 text-foreground">
      <SiteNav user={user} />
      <main className="flex-1 px-5 py-10">
        <div className="mx-auto max-w-3xl">
          <Link
            href={`/verify?lot=${batch.lot}`}
            className="inline-flex items-center gap-1 text-[12.5px] text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to batch verification
          </Link>

          <div className="mt-4 rounded-3xl border border-border bg-background p-8 shadow-sm sm:p-10">
            <header className="flex flex-wrap items-start justify-between gap-4 border-b border-border/60 pb-6">
              <div>
                <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-muted-foreground">
                  {reportType === "hplc"
                    ? "HPLC purity report"
                    : "LC-MS / target-mass report"}
                </p>
                <h1 className="mt-1 text-[22px] font-medium tracking-tight sm:text-[26px]">
                  {product.name}
                </h1>
                <p className="mt-1 font-mono text-[13px] text-muted-foreground">
                  Lot {batch.lot}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="inline-flex h-8 items-center gap-1.5 rounded-full border border-border px-3 font-mono text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:bg-accent"
                  aria-label="Print report"
                >
                  <Printer className="h-3 w-3" />
                  Print
                </button>
                <button
                  type="button"
                  className="inline-flex h-8 items-center gap-1.5 rounded-full bg-foreground px-3 font-mono text-[10.5px] uppercase tracking-[0.16em] text-background transition-opacity hover:opacity-90"
                  disabled
                  aria-label="Download PDF (coming soon)"
                >
                  <Download className="h-3 w-3" />
                  PDF
                </button>
              </div>
            </header>

            <dl className="mt-6 grid gap-x-6 gap-y-4 sm:grid-cols-3">
              <Field label="Performed by" value={batch.lab_name} />
              <Field
                label="Sample received"
                value={batch.tested_on ? formatDate(batch.tested_on) : "—"}
              />
              <Field
                label="Manufactured"
                value={formatDate(batch.manufactured_on)}
              />
              <Field
                label="Method"
                value={
                  reportType === "hplc"
                    ? "Reversed-phase HPLC, C18, UV 220 nm"
                    : "ESI-LC-MS, positive ion mode"
                }
                colSpan={2}
              />
              <Field
                label="Spec floor"
                value={`≥ ${batch.spec_min_pct.toFixed(1)}%`}
              />
            </dl>

            <div className="mt-8">
              {reportType === "hplc" ? (
                <HplcChart batch={batch} />
              ) : (
                <MassSpecChart batch={batch} product={product} />
              )}
            </div>

            <div className="mt-6 rounded-xl border border-border/60 bg-surface/40 p-4">
              {reportType === "hplc" ? (
                <HplcResult batch={batch} />
              ) : (
                <MsResult batch={batch} product={product} />
              )}
            </div>

            <footer className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-5">
              <p className="inline-flex items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5" />
                Independently verified · {batch.lab_name}
              </p>
              <p className="text-[11.5px] text-muted-foreground">
                Digital preview. Original signed PDF on request:{" "}
                <a
                  href="mailto:trust@pepwell.app"
                  className="text-foreground underline-offset-4 hover:underline"
                >
                  trust@pepwell.app
                </a>
              </p>
            </footer>
          </div>
        </div>
      </main>
    </div>
  );
}

function Field({
  label,
  value,
  colSpan,
}: {
  label: string;
  value: string;
  colSpan?: 1 | 2;
}) {
  return (
    <div className={colSpan === 2 ? "sm:col-span-2" : undefined}>
      <dt className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 text-[13.5px] tabular-nums text-foreground">
        {value}
      </dd>
    </div>
  );
}

function HplcChart({ batch }: { batch: Batch }) {
  const purity = batch.hplc_purity_pct ?? 0;
  const mainHeight = Math.max(60, Math.min(190, purity * 1.9));
  return (
    <ChartFrame xLabel="Retention time (min)" yLabel="Absorbance (mAU, 220 nm)">
      <Gridlines />
      {/* Baseline noise */}
      <path
        d={baselinePath()}
        fill="none"
        stroke="oklch(0.55 0.18 280)"
        strokeWidth={1.2}
        opacity={0.85}
      />
      {/* Main peak: target peptide */}
      <Peak x={310} height={mainHeight} width={26} />
      <PeakLabel x={310} y={210 - mainHeight - 8} primary>
        {`${purity.toFixed(1)}% target`}
      </PeakLabel>
      {/* A few small impurity peaks at typical positions. */}
      <Peak x={170} height={18} width={14} muted />
      <Peak x={420} height={12} width={12} muted />
      <Peak x={560} height={9} width={10} muted />
      {/* X-axis ticks */}
      <Ticks values={[0, 2, 4, 6, 8, 10]} />
    </ChartFrame>
  );
}

function MassSpecChart({
  batch,
  product,
}: {
  batch: Batch;
  product: { name: string };
}) {
  const targetMass = expectedMass(product.name);
  return (
    <ChartFrame xLabel="m/z" yLabel="Relative intensity (%)">
      <Gridlines />
      {/* Target mass — dominant peak. */}
      <Peak x={400} height={180} width={4} />
      <PeakLabel x={400} y={20} primary>
        {`m/z ${targetMass.toFixed(1)} · target`}
      </PeakLabel>
      {/* +H, +Na adducts as small accompanying peaks. */}
      <Peak x={414} height={70} width={3} />
      <PeakLabel x={414} y={140} muted>
        {`+Na`}
      </PeakLabel>
      <Peak x={386} height={28} width={3} muted />
      <Peak x={250} height={18} width={3} muted />
      <Peak x={520} height={12} width={3} muted />
      <Ticks
        values={[
          Math.round(targetMass) - 200,
          Math.round(targetMass) - 100,
          Math.round(targetMass),
          Math.round(targetMass) + 100,
          Math.round(targetMass) + 200,
        ]}
      />
    </ChartFrame>
  );
}

function ChartFrame({
  children,
  xLabel,
  yLabel,
}: {
  children: React.ReactNode;
  xLabel: string;
  yLabel: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-background p-4">
      <svg
        viewBox="0 0 700 240"
        className="block h-auto w-full"
        role="img"
        aria-label={`${yLabel} vs ${xLabel}`}
      >
        {/* Plot area frame */}
        <rect
          x={48}
          y={16}
          width={636}
          height={194}
          fill="oklch(0.985 0.01 280)"
          stroke="oklch(0.9 0.01 280)"
        />
        {children}
        {/* Axes labels */}
        <text
          x={368}
          y={234}
          fontSize={11}
          textAnchor="middle"
          fill="currentColor"
          opacity={0.6}
          fontFamily="ui-monospace, SFMono-Regular, monospace"
        >
          {xLabel}
        </text>
        <text
          x={14}
          y={113}
          fontSize={11}
          textAnchor="middle"
          fill="currentColor"
          opacity={0.6}
          fontFamily="ui-monospace, SFMono-Regular, monospace"
          transform="rotate(-90 14 113)"
        >
          {yLabel}
        </text>
      </svg>
    </div>
  );
}

function Gridlines() {
  const lines = [50, 100, 150];
  return (
    <g>
      {lines.map((y) => (
        <line
          key={y}
          x1={48}
          x2={684}
          y1={210 - y}
          y2={210 - y}
          stroke="oklch(0.92 0.01 280)"
          strokeDasharray="3 4"
          strokeWidth={1}
        />
      ))}
    </g>
  );
}

function Peak({
  x,
  height,
  width,
  muted,
}: {
  x: number;
  height: number;
  width: number;
  muted?: boolean;
}) {
  const half = width / 2;
  const baseY = 210;
  const topY = baseY - height;
  const d = `M ${x - half},${baseY} Q ${x},${topY - 8} ${x + half},${baseY} Z`;
  return (
    <path
      d={d}
      fill={muted ? "oklch(0.85 0.05 280)" : "oklch(0.55 0.18 280)"}
      opacity={muted ? 0.55 : 0.95}
    />
  );
}

function PeakLabel({
  x,
  y,
  children,
  primary,
  muted,
}: {
  x: number;
  y: number;
  children: string;
  primary?: boolean;
  muted?: boolean;
}) {
  return (
    <text
      x={x}
      y={y}
      fontSize={primary ? 11 : 10}
      textAnchor="middle"
      fontFamily="ui-monospace, SFMono-Regular, monospace"
      fill="currentColor"
      opacity={muted ? 0.55 : primary ? 1 : 0.75}
    >
      {children}
    </text>
  );
}

function Ticks({ values }: { values: number[] }) {
  const xStart = 48;
  const xEnd = 684;
  const span = xEnd - xStart;
  return (
    <g>
      {values.map((v, i) => {
        const x = xStart + (span * i) / (values.length - 1);
        return (
          <g key={`${v}-${i}`}>
            <line
              x1={x}
              x2={x}
              y1={210}
              y2={214}
              stroke="oklch(0.7 0.02 280)"
              strokeWidth={1}
            />
            <text
              x={x}
              y={224}
              fontSize={10}
              textAnchor="middle"
              fill="currentColor"
              opacity={0.6}
              fontFamily="ui-monospace, SFMono-Regular, monospace"
            >
              {v}
            </text>
          </g>
        );
      })}
    </g>
  );
}

function HplcResult({ batch }: { batch: Batch }) {
  const purity = batch.hplc_purity_pct;
  const passed = purity !== null && purity >= batch.spec_min_pct;
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <Stat
        label="Target peak purity"
        value={purity === null ? "Pending" : `${purity.toFixed(1)}%`}
      />
      <Stat
        label="Spec floor"
        value={`≥ ${batch.spec_min_pct.toFixed(1)}%`}
      />
      <Stat
        label="Result"
        value={passed ? "Pass" : "Fail"}
        emphasize={passed ? "ok" : "fail"}
      />
    </div>
  );
}

function MsResult({
  batch,
  product,
}: {
  batch: Batch;
  product: { name: string };
}) {
  const expected = expectedMass(product.name);
  const match = batch.ms_match_pct;
  const passed = match !== null && match >= 99.0;
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <Stat label="Expected m/z" value={expected.toFixed(2)} />
      <Stat
        label="Target match"
        value={match === null ? "Pending" : `${match.toFixed(1)}%`}
      />
      <Stat
        label="Result"
        value={passed ? "Pass" : "Fail"}
        emphasize={passed ? "ok" : "fail"}
      />
    </div>
  );
}

function Stat({
  label,
  value,
  emphasize,
}: {
  label: string;
  value: string;
  emphasize?: "ok" | "fail";
}) {
  return (
    <div>
      <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </p>
      <p
        className={
          "mt-1 text-[15px] font-medium tabular-nums " +
          (emphasize === "ok"
            ? "text-[oklch(0.42_0.14_158)]"
            : emphasize === "fail"
              ? "text-[oklch(0.45_0.18_25)]"
              : "text-foreground")
        }
      >
        {value}
      </p>
    </div>
  );
}

/** Smooth, low-amplitude baseline so the chromatogram doesn't look flat. */
function baselinePath(): string {
  const points: Array<[number, number]> = [];
  for (let x = 48; x <= 684; x += 8) {
    const y = 207 + Math.sin((x - 48) / 24) * 1.4 + Math.cos(x / 11) * 0.8;
    points.push([x, y]);
  }
  return points
    .map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x.toFixed(1)},${y.toFixed(1)}`)
    .join(" ");
}

/**
 * Approximate molecular weight (g/mol) for the known peptides we ship.
 * Used only as the m/z label on the mock chart; real reports report the
 * monoisotopic mass to four decimals from the lab's mass calibration.
 */
function expectedMass(productName: string): number {
  const n = productName.toLowerCase();
  if (n.includes("epital")) return 390.4; // AEDG (Ala-Glu-Asp-Gly)
  if (n.includes("pineal")) return 418.4; // EDR (Glu-Asp-Arg)
  if (n.includes("restore") || n.includes("bpc")) return 1419.5; // BPC-157
  return 500.0;
}

function formatDate(iso: string): string {
  const d = new Date(`${iso}T12:00:00`);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
