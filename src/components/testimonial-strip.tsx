import { Star } from "lucide-react";
import { TESTIMONIALS } from "@/lib/testimonials";

export function TestimonialStrip({ className }: { className?: string }) {
  return (
    <div className={className}>
      <div className="grid gap-3 sm:grid-cols-3">
        {TESTIMONIALS.map((t) => (
          <article
            key={t.id}
            className="flex flex-col rounded-2xl border border-border bg-background p-4"
          >
            <header className="flex items-center gap-2.5">
              <Avatar initials={t.initials} hue={t.hue} />
              <div className="min-w-0">
                <p className="truncate text-[13px] font-medium text-foreground">
                  {t.name}, {t.age}
                </p>
                <p className="truncate text-[11.5px] text-muted-foreground">
                  {t.occupation}
                </p>
              </div>
              <div className="ml-auto flex items-center">
                {[0, 1, 2, 3, 4].map((i) => (
                  <Star
                    key={i}
                    className="h-3 w-3 fill-foreground text-foreground"
                  />
                ))}
              </div>
            </header>

            <p className="mt-3 text-[12.5px] leading-relaxed text-muted-foreground">
              <span className="font-medium text-foreground">Started:</span>{" "}
              {t.complaint}
            </p>
            <p className="mt-2 text-[12.5px] leading-relaxed text-muted-foreground">
              <span className="font-medium text-foreground">
                Week {t.weeks}:
              </span>{" "}
              {t.outcome}
            </p>
            {t.metric && (
              <p className="mt-3 inline-flex w-fit rounded-full bg-foreground/5 px-2.5 py-1 font-mono text-[10.5px] uppercase tracking-[0.12em] text-foreground/80">
                {t.metric}
              </p>
            )}
            <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              On {t.product_short} · {t.weeks} weeks
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}

function Avatar({ initials, hue }: { initials: string; hue: number }) {
  return (
    <div
      aria-hidden
      className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full ring-1 ring-border"
    >
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(120% 90% at 30% 25%, oklch(0.94 0.05 ${hue}), oklch(0.62 0.14 ${hue}) 65%, oklch(0.30 0.08 ${hue}) 110%)`,
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center text-[11px] font-medium tracking-tight text-white">
        {initials}
      </div>
    </div>
  );
}
