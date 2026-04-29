"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Sparkles, Loader2 } from "lucide-react";

const SUGGESTIONS = [
  "Build me a daily foundation stack",
  "I want to lose 20 lbs without losing muscle",
  "Help me sleep deeper and recover faster",
  "Sharper focus during deep work blocks",
  "Longevity stack — I'm 38",
];

const ROTATING_PLACEHOLDERS = [
  "Tell me your goal — sleep, performance, focus, longevity…",
  "Just starting? Try \u201ca clean daily foundation\u201d.",
  "Lifting hard? Tell me about your training.",
  "What does your body need? Be as specific as you want.",
];

export function AiIntakePrompt({
  variant = "dark",
}: {
  variant?: "dark" | "light";
}) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const [typed, setTyped] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  /* Rotating, type-on placeholder when input is empty */
  useEffect(() => {
    if (value) return;
    const target = ROTATING_PLACEHOLDERS[placeholderIdx];
    let i = 0;
    setTyped("");
    const tick = setInterval(() => {
      i += 1;
      setTyped(target.slice(0, i));
      if (i >= target.length) {
        clearInterval(tick);
        const hold = setTimeout(
          () => setPlaceholderIdx((n) => (n + 1) % ROTATING_PLACEHOLDERS.length),
          2400,
        );
        return () => clearTimeout(hold);
      }
    }, 38);
    return () => clearInterval(tick);
  }, [placeholderIdx, value]);

  function handleSubmit(prompt?: string) {
    const text = (prompt ?? value).trim();
    if (!text) return;
    setSubmitting(true);
    try {
      sessionStorage.setItem("medicine.intake.seed", text);
    } catch {
      /* ignore */
    }
    router.push(`/intake?q=${encodeURIComponent(text)}`);
  }

  const isDark = variant === "dark";

  return (
    <div className="w-full max-w-2xl">
      {/* ─── Prompt input ─── */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
        className={
          isDark
            ? "group relative rounded-[28px] border border-white/15 bg-white/8 p-2 backdrop-blur-xl shadow-2xl transition-all focus-within:border-white/40 focus-within:bg-white/12"
            : "group relative rounded-[28px] border border-border/70 bg-white p-2 shadow-elevated transition-all focus-within:border-primary/40 focus-within:ring-4 focus-within:ring-primary/10"
        }
      >
        <div className="flex items-center gap-3 pl-4">
          <Sparkles
            className={
              isDark
                ? "h-4 w-4 shrink-0 text-blue-300"
                : "h-4 w-4 shrink-0 text-primary"
            }
          />
          <input
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={typed || ROTATING_PLACEHOLDERS[0]}
            className={
              isDark
                ? "h-12 flex-1 bg-transparent text-[15px] text-white placeholder:text-white/40 focus:outline-none"
                : "h-12 flex-1 bg-transparent text-[15px] text-foreground placeholder:text-muted-foreground/70 focus:outline-none"
            }
            spellCheck={false}
          />
          <button
            type="submit"
            disabled={submitting}
            aria-label="Start intake"
            className="inline-flex h-10 items-center gap-1.5 rounded-full bg-primary px-4 text-[13px] font-semibold text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-60"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                Build Protocol
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* ─── Suggestion chips ─── */}
      <div className="mt-4 flex flex-wrap gap-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => handleSubmit(s)}
            className={
              isDark
                ? "rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[12px] text-white/70 transition-all hover:border-white/30 hover:bg-white/10 hover:text-white"
                : "rounded-full border border-border bg-white px-3 py-1.5 text-[12px] text-muted-foreground transition-all hover:border-primary/40 hover:bg-primary/5 hover:text-foreground"
            }
          >
            {s}
          </button>
        ))}
      </div>

      {/* ─── Trust line ─── */}
      <p
        className={
          isDark
            ? "mt-5 text-[12px] text-white/45"
            : "mt-5 text-[12px] text-muted-foreground"
        }
      >
        Your AI intake takes ~3 min. Reviewed by our care team. HSA/FSA
        eligible · Ships free · Cancel anytime.
      </p>
    </div>
  );
}
