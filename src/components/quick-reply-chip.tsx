import {
  Moon,
  Brain,
  Activity,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

type ChipKey = "sleep" | "cognition" | "recovery" | "longevity";

const CHIPS: Record<
  ChipKey,
  { icon: LucideIcon; label: string; prompt: string; hue: number }
> = {
  sleep: {
    icon: Moon,
    label: "Sleep",
    prompt: "I'm waking up at 3 a.m. and can't get back down.",
    hue: 260,
  },
  cognition: {
    icon: Brain,
    label: "Cognition",
    prompt: "Brain fog has gotten bad and I can't think clearly at work.",
    hue: 220,
  },
  recovery: {
    icon: Activity,
    label: "Recovery",
    prompt: "I'm recovering from a knee surgery. What helps?",
    hue: 175,
  },
  longevity: {
    icon: Sparkles,
    label: "Longevity",
    prompt: "I want to age slower. What should I start with?",
    hue: 280,
  },
};

export const CHIP_ORDER: ChipKey[] = [
  "sleep",
  "cognition",
  "recovery",
  "longevity",
];

export function QuickReplyChip({
  chip,
  onClick,
  className,
}: {
  chip: ChipKey;
  onClick: (prompt: string) => void;
  className?: string;
}) {
  const c = CHIPS[chip];
  const Icon = c.icon;

  return (
    <button
      type="button"
      onClick={() => onClick(c.prompt)}
      className={cn(
        "group inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-3 py-1.5 text-[12.5px] text-foreground/80 transition-all hover:border-foreground/30 hover:bg-background hover:text-foreground",
        className,
      )}
    >
      <span
        className="grid h-5 w-5 place-items-center rounded-full"
        style={{
          background: `radial-gradient(circle at 35% 30%, oklch(0.90 0.05 ${c.hue}), oklch(0.62 0.16 ${c.hue}))`,
        }}
      >
        <Icon className="h-3 w-3 text-white" strokeWidth={2.4} />
      </span>
      <span className="font-medium">{c.label}</span>
      <span className="hidden text-muted-foreground sm:inline">
        — {c.prompt.replace(/\.$/, "")}
      </span>
    </button>
  );
}
