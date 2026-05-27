import { Check, Sparkles } from "lucide-react";
import { CapsuleIllustration } from "@/components/capsule-illustration";
import { categoryForProduct, getPalette } from "@/lib/category-palette";
import { cn } from "@/lib/utils";

/**
 * Static example of what a finished protocol looks like, shown to first-time
 * visitors *before* they type anything. Makes the chat's output legible and
 * lowers the cost of starting a conversation.
 */
export function ProtocolPreview({
  className,
  onUseExample,
}: {
  className?: string;
  onUseExample?: () => void;
}) {
  return (
    <div className={cn("relative", className)}>
      <div className="absolute -top-3 left-4 z-10 inline-flex items-center gap-1 rounded-full border border-border bg-background px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
        <Sparkles className="h-3 w-3" />
        Example protocol
      </div>
      <div className="rounded-2xl border border-border bg-background/60 p-1 backdrop-blur-sm">
        <div className="rounded-[14px] bg-background p-5">
          <header className="flex items-baseline justify-between">
            <div>
              <p className="text-[14px] font-medium text-foreground">
                For: sleep + cognitive recovery, 8 weeks
              </p>
              <p className="mt-0.5 text-[12px] text-muted-foreground">
                Based on 1,247 users 35–45 with similar goals
              </p>
            </div>
            <span className="rounded-full bg-foreground/5 px-2 py-0.5 text-[11px] text-foreground/80">
              Most common
            </span>
          </header>

          <div className="mt-4 space-y-2">
            <PreviewRow
              id="epitalon"
              name="epitalON · 1 capsule, evening"
              caption="AEDG · circadian recalibration"
              price={149}
            />
            <PreviewRow
              id="pinealon"
              name="pinealON · 2 capsules, morning"
              caption="EDR · daytime cognitive support"
              price={149}
            />
          </div>

          <div className="mt-4 space-y-1.5 border-t border-border/60 pt-3 text-[12px] text-muted-foreground">
            <p className="flex items-start gap-1.5">
              <Check className="mt-0.5 h-3 w-3 shrink-0 text-foreground" />
              Routes around stimulants — works on the systems they're masking.
            </p>
            <p className="flex items-start gap-1.5">
              <Check className="mt-0.5 h-3 w-3 shrink-0 text-foreground" />
              60-day default. Reassess at day 45 with Dr. Levin.
            </p>
          </div>

          <button
            type="button"
            onClick={onUseExample}
            className="mt-4 w-full rounded-xl border border-border bg-background py-2 text-[12.5px] text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
          >
            Tell me what to do for my situation →
          </button>
        </div>
      </div>
    </div>
  );
}

function PreviewRow({
  id,
  name,
  caption,
  price,
}: {
  id: string;
  name: string;
  caption: string;
  price: number;
}) {
  const palette = getPalette(categoryForProduct(id));
  return (
    <div
      className="flex items-center gap-3 overflow-hidden rounded-xl border border-border/60 p-2"
      style={{
        background: `linear-gradient(135deg, ${palette.bgFrom}, ${palette.bgTo})`,
      }}
    >
      <CapsuleIllustration
        palette={palette}
        floating={false}
        className="h-12 w-12 shrink-0"
        tilt={-18}
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13.5px] font-medium text-foreground">
          {name}
        </p>
        <p className="truncate text-[11.5px] text-foreground/65">{caption}</p>
      </div>
      <span className="shrink-0 text-[13px] font-medium tabular-nums">
        ${price}
      </span>
    </div>
  );
}
