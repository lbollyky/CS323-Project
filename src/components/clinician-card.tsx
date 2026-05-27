import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PRIMARY_CLINICIAN } from "@/lib/clinician";
import { cn } from "@/lib/utils";

/**
 * The named clinician who reviews and signs every protocol. Replaces
 * anonymous "many users find this helpful" SaaS-voice.
 *
 * Compact variant lives inline in chat protocol cards; default variant
 * lives in the home trust block.
 */
export function ClinicianCard({
  variant = "default",
  className,
}: {
  variant?: "default" | "compact" | "inline";
  className?: string;
}) {
  const c = PRIMARY_CLINICIAN;

  if (variant === "inline") {
    return (
      <div
        className={cn(
          "flex items-center gap-2 text-[12px] text-muted-foreground",
          className,
        )}
      >
        <Avatar initials={c.initials} size={20} />
        <span>
          Reviewed by{" "}
          <span className="font-medium text-foreground">{c.name}</span>
        </span>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div
        className={cn(
          "flex items-center gap-3 rounded-xl border border-border bg-background p-3",
          className,
        )}
      >
        <Avatar initials={c.initials} size={36} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-medium text-foreground">
            {c.name}
          </p>
          <p className="truncate text-[11.5px] text-muted-foreground">
            {c.credentials}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-background p-5",
        className,
      )}
    >
      <div className="flex items-start gap-4">
        <Avatar initials={c.initials} size={56} />
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[15px] font-medium text-foreground">
                {c.name}
              </p>
              <p className="mt-0.5 text-[12.5px] text-muted-foreground">
                {c.credentials} · {c.years_in_practice} yrs · {c.location}
              </p>
            </div>
            <Link
              href="/clinician"
              className="hidden shrink-0 items-center gap-0.5 text-[12px] text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
            >
              Read reasoning
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          <p className="mt-3 text-[13.5px] leading-relaxed text-foreground/85">
            &ldquo;{c.philosophy}&rdquo;
          </p>
          <p className="mt-3 font-mono text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground">
            {c.license}
          </p>
        </div>
      </div>
    </div>
  );
}

function Avatar({ initials, size }: { initials: string; size: number }) {
  return (
    <div
      aria-hidden
      style={{ width: size, height: size }}
      className="relative shrink-0 overflow-hidden rounded-full ring-1 ring-border"
    >
      {/* Gradient ground that reads as a real portrait at thumbnail size. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 30% 25%, oklch(0.94 0.04 250), oklch(0.62 0.14 260) 65%, oklch(0.30 0.08 260) 110%)",
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center font-medium tracking-tight text-white">
        <span style={{ fontSize: size * 0.42 }}>{initials}</span>
      </div>
    </div>
  );
}
