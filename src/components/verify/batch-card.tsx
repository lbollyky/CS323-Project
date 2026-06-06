import Link from "next/link";
import { Beaker, Check, FileText, ShieldAlert, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  type Batch,
  type BatchStatus,
  getBatchProductInfo,
} from "@/lib/batches";

const STATUS_META: Record<
  BatchStatus,
  {
    label: string;
    icon: typeof Check;
    /** Background color for the status pill (oklch with alpha). */
    bg: string;
    /** Foreground color for the status pill. */
    fg: string;
  }
> = {
  released: {
    label: "Released",
    icon: Check,
    bg: "oklch(0.93 0.05 158)",
    fg: "oklch(0.38 0.14 158)",
  },
  pending: {
    label: "Awaiting results",
    icon: Clock,
    bg: "oklch(0.93 0.04 80)",
    fg: "oklch(0.42 0.14 60)",
  },
  quarantined: {
    label: "Quarantined",
    icon: ShieldAlert,
    bg: "oklch(0.93 0.05 25)",
    fg: "oklch(0.45 0.18 25)",
  },
};

export function BatchCard({ batch }: { batch: Batch }) {
  const product = getBatchProductInfo(batch.product_id);
  const meta = STATUS_META[batch.status];
  const StatusIcon = meta.icon;

  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-background/90 shadow-sm">
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-border/60 px-5 py-4">
        <div className="min-w-0">
          <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-muted-foreground">
            Lot
          </p>
          <p className="mt-0.5 font-mono text-[15px] font-medium tracking-tight text-foreground">
            {batch.lot}
          </p>
        </div>
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em]"
          style={{ background: meta.bg, color: meta.fg }}
        >
          <StatusIcon className="h-3 w-3" strokeWidth={2.5} />
          {meta.label}
        </span>
      </header>

      <div className="px-5 py-4">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h3 className="text-[15px] font-medium tracking-tight">
            {product.name}
          </h3>
          <p className="text-[12px] text-muted-foreground">{product.category}</p>
        </div>

        <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-[12.5px]">
          <Row label="Manufactured" value={formatDate(batch.manufactured_on)} />
          <Row
            label="Tested"
            value={batch.tested_on ? formatDate(batch.tested_on) : "—"}
          />
          <Row label="Lab" value={batch.lab_name} />
          <Row
            label={`HPLC purity (≥ ${batch.spec_min_pct.toFixed(1)}%)`}
            value={
              batch.hplc_purity_pct === null
                ? "Pending"
                : `${batch.hplc_purity_pct.toFixed(1)}%`
            }
            tone={tone(batch.hplc_purity_pct, batch.spec_min_pct)}
          />
          <Row
            label="MS target match"
            value={
              batch.ms_match_pct === null
                ? "Pending"
                : `${batch.ms_match_pct.toFixed(1)}%`
            }
            tone={tone(batch.ms_match_pct, 99.0)}
            colSpan={2}
          />
        </dl>

        {batch.note && (
          <p
            className="mt-4 rounded-lg border border-border/60 px-3 py-2 text-[12px] leading-relaxed"
            style={{
              background: STATUS_META.quarantined.bg,
              color: STATUS_META.quarantined.fg,
            }}
          >
            {batch.note}
          </p>
        )}
      </div>

      <footer className="grid grid-cols-2 divide-x divide-border/60 border-t border-border/60">
        <ReportLink
          href={batch.hplc_report_url}
          label="HPLC report"
          icon={Beaker}
        />
        <ReportLink
          href={batch.ms_report_url}
          label="Mass spec"
          icon={FileText}
        />
      </footer>
    </article>
  );
}

function Row({
  label,
  value,
  tone,
  colSpan,
}: {
  label: string;
  value: string;
  tone?: "ok" | "fail";
  colSpan?: 1 | 2;
}) {
  return (
    <div className={cn(colSpan === 2 && "col-span-2")}>
      <dt className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </dt>
      <dd
        className={cn(
          "mt-1 text-[13.5px] tabular-nums",
          tone === "ok" && "text-foreground",
          tone === "fail" &&
            "font-medium text-[oklch(0.45_0.18_25)] dark:text-[oklch(0.7_0.15_25)]",
        )}
      >
        {value}
      </dd>
    </div>
  );
}

function ReportLink({
  href,
  label,
  icon: Icon,
}: {
  href: string | null;
  label: string;
  icon: typeof Beaker;
}) {
  if (!href) {
    return (
      <span className="flex items-center justify-center gap-2 px-4 py-3 text-[12.5px] text-muted-foreground/70">
        <Icon className="h-3.5 w-3.5" />
        {label} pending
      </span>
    );
  }
  return (
    <Link
      href={href}
      className="flex items-center justify-center gap-2 px-4 py-3 text-[12.5px] font-medium text-foreground transition-colors hover:bg-accent/50"
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </Link>
  );
}

function tone(value: number | null, floor: number): "ok" | "fail" | undefined {
  if (value === null) return undefined;
  return value >= floor ? "ok" : "fail";
}

function formatDate(iso: string): string {
  const d = new Date(`${iso}T12:00:00`);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
