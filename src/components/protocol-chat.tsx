"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowUp, ChevronDown } from "lucide-react";
import { PRODUCTS, getProduct, type ProtocolProduct } from "@/lib/products";
import { useCartStore } from "@/stores/cart-store";
import { cn } from "@/lib/utils";
import {
  ProtocolBuilder,
  type ProtocolMeta,
} from "@/components/protocol-builder";
import { ClinicianCard } from "@/components/clinician-card";
import { TestimonialStrip } from "@/components/testimonial-strip";
import { ProtocolPreview } from "@/components/protocol-preview";
import { GoalTileBackbone } from "@/components/goal-tile-backbone";

const ALLOWED_IDS = new Set(PRODUCTS.map((p) => p.id));

// Matches the quick-reply marker the model appends to question turns, e.g.
// "[[suggest: Trouble falling asleep | I wake at 3 a.m. | Both]]".
// Tolerant of a partial/streaming marker so we can hide it mid-stream.
const SUGGEST_RE = /\[\[\s*suggest:\s*([\s\S]*?)\]\]/i;
const SUGGEST_PARTIAL_RE = /\[\[\s*suggest:[\s\S]*$/i;

interface ParsedRecommendation {
  body: string;
  ids: string[];
  meta: ProtocolMeta;
  suggestions: string[];
}

/**
 * Pulls the structured `protocol` JSON block and the quick-reply marker out
 * of the assistant message, returning the cleaned prose plus parsed data.
 * Tolerant of partial blocks while the response is still streaming.
 */
function extractRecommendation(text: string): ParsedRecommendation {
  const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
  let ids: string[] = [];
  const meta: ProtocolMeta = {};
  let body = text;

  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[1]);
      const raw =
        parsed.recommended_product_ids ?? parsed.recommended_products ?? [];
      ids = (Array.isArray(raw) ? raw : [])
        .map((id: unknown) => String(id).toLowerCase().trim())
        .filter((id: string) => ALLOWED_IDS.has(id));
      if (typeof parsed.goal === "string") meta.goal = parsed.goal;
      if (typeof parsed.duration_weeks === "number")
        meta.duration_weeks = parsed.duration_weeks;
      if (typeof parsed.cohort === "string") meta.cohort = parsed.cohort;
      if (typeof parsed.cohort_outcome === "string")
        meta.cohort_outcome = parsed.cohort_outcome;
    } catch {
      /* ignore — likely mid-stream */
    }
    body = body.replace(/```json[\s\S]*?```/g, "").trim();
  }

  // Parse + strip the quick-reply marker.
  let suggestions: string[] = [];
  const suggestMatch = body.match(SUGGEST_RE);
  if (suggestMatch) {
    suggestions = suggestMatch[1]
      .split("|")
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 3);
    body = body.replace(SUGGEST_RE, "").trim();
  } else {
    // Hide a half-streamed marker so the user never sees "[[suggest:".
    body = body.replace(SUGGEST_PARTIAL_RE, "").trim();
  }

  return { body, ids, meta, suggestions };
}

export function ProtocolChat() {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [draft, setDraft] = useState("");
  const [lastQuery, setLastQuery] = useState("");
  const setItems = useCartStore((s) => s.setItems);

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat/protocol" }),
  });

  const isLoading = status === "submitted" || status === "streaming";
  const hasConversation = messages.length > 0;

  // Latest assistant recommendation drives the live ProtocolBuilder panel.
  const latestProtocol = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      const m = messages[i];
      if (m.role !== "assistant") continue;
      const raw =
        m.parts
          ?.filter(
            (p): p is { type: "text"; text: string } => p.type === "text",
          )
          .map((p) => p.text)
          .join("") ?? "";
      const parsed = extractRecommendation(raw);
      if (parsed.ids.length > 0) return parsed;
    }
    return null;
  }, [messages]);

  const protocolProducts = useMemo<ProtocolProduct[]>(() => {
    if (!latestProtocol) return [];
    return latestProtocol.ids
      .map((id) => getProduct(id))
      .filter((p): p is ProtocolProduct => Boolean(p));
  }, [latestProtocol]);

  // ── Right-side "building" animation ───────────────────────────
  // Progress advances with the conversation (one stage per answered
  // question) and persists across messages. When the protocol is parsed
  // and streaming has settled, we hold a short finishing beat with every
  // stage complete, then reveal the protocol.
  const hasProtocol = protocolProducts.length > 0;
  const assistantTurns = useMemo(
    () => messages.filter((m) => m.role === "assistant").length,
    [messages],
  );
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (!hasProtocol) {
      setRevealed(false);
      return;
    }
    if (!isLoading) {
      const t = setTimeout(() => setRevealed(true), 1100);
      return () => clearTimeout(t);
    }
  }, [hasProtocol, isLoading]);

  const building = hasConversation && (!hasProtocol || !revealed);
  const buildDone = hasProtocol && !isLoading && !revealed;

  // Quick-reply chips come from the most recent assistant message. We hide
  // them while a response is streaming and once the user starts typing.
  const suggestions = useMemo<string[]>(() => {
    const last = messages[messages.length - 1];
    if (!last || last.role !== "assistant") return [];
    const raw =
      last.parts
        ?.filter(
          (p): p is { type: "text"; text: string } => p.type === "text",
        )
        .map((p) => p.text)
        .join("") ?? "";
    return extractRecommendation(raw).suggestions;
  }, [messages]);

  const showSuggestions =
    !isLoading && draft.trim().length === 0 && suggestions.length > 0;

  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  function submit(text?: string) {
    const value = (text ?? draft).trim();
    if (!value || isLoading) return;
    setDraft("");
    setLastQuery(value);
    sendMessage({ text: value });
    inputRef.current?.focus();
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    submit();
  }

  function startCheckout() {
    setItems(protocolProducts);
    router.push("/checkout");
  }

  // ──────────────────────────────────────────────────────────────
  // Landing state (no messages yet): centered composer, hero copy
  // pared back, trust block + protocol preview below the fold.
  // ──────────────────────────────────────────────────────────────
  if (!hasConversation) {
    return (
      <LandingState
        draft={draft}
        setDraft={setDraft}
        inputRef={inputRef}
        onSubmit={handleSubmit}
        onChip={(prompt) => submit(prompt)}
        onUseExample={() =>
          submit("I want better sleep and sharper focus over the next 8 weeks.")
        }
        isLoading={isLoading}
      />
    );
  }

  // ──────────────────────────────────────────────────────────────
  // Conversation state: split layout. Chat on the left, live
  // protocol builder on the right. Composer docked at the bottom.
  // ──────────────────────────────────────────────────────────────
  return (
    <div className="relative flex flex-1 flex-col">
      <div className="mx-auto grid w-full max-w-6xl flex-1 grid-cols-1 gap-6 px-5 pb-44 pt-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        {/* Conversation column */}
        <div
          ref={scrollRef}
          className="flex flex-col gap-6 overflow-y-auto"
        >
          <ClinicianCard variant="inline" />

          {messages.map((message) => {
            const isAssistant = message.role === "assistant";
            const raw =
              message.parts
                ?.filter(
                  (p): p is { type: "text"; text: string } => p.type === "text",
                )
                .map((p) => p.text)
                .join("") ?? "";
            if (!raw && !isLoading) return null;

            const { body } = extractRecommendation(raw);

            return (
              <div
                key={message.id}
                className={cn(
                  "flex flex-col",
                  isAssistant ? "items-start" : "items-end",
                )}
              >
                <div
                  className={cn(
                    "max-w-[90%] text-[15px] leading-relaxed",
                    isAssistant
                      ? "text-foreground"
                      : "rounded-2xl bg-foreground px-4 py-2.5 text-background",
                  )}
                >
                  {body.split(/\n\n+/).map((para, i) => (
                    <p
                      key={i}
                      className={cn("whitespace-pre-wrap", i > 0 && "mt-3")}
                    >
                      {para}
                    </p>
                  ))}
                </div>
              </div>
            );
          })}

          {isLoading &&
            messages[messages.length - 1]?.role !== "assistant" && (
              <div className="flex items-center gap-1.5 py-1 text-foreground">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-foreground/60 [animation-delay:0ms]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-foreground/60 [animation-delay:120ms]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-foreground/60 [animation-delay:240ms]" />
              </div>
            )}
        </div>

        {/* Live protocol panel */}
        <div className="hidden lg:block">
          <div className="sticky top-20">
            <ProtocolBuilder
              products={protocolProducts}
              meta={latestProtocol?.meta ?? {}}
              isStreaming={isLoading}
              query={lastQuery}
              building={building}
              buildTurns={assistantTurns}
              buildDone={buildDone}
              onCheckout={startCheckout}
            />
          </div>
        </div>

        {/* Mobile: builder inline, after the chat */}
        {(building || protocolProducts.length > 0) && (
          <div className="lg:hidden">
            <ProtocolBuilder
              products={protocolProducts}
              meta={latestProtocol?.meta ?? {}}
              isStreaming={isLoading}
              query={lastQuery}
              building={building}
              buildTurns={assistantTurns}
              buildDone={buildDone}
              onCheckout={startCheckout}
            />
          </div>
        )}
      </div>

      {/* Docked composer */}
      <DockedComposer
        draft={draft}
        setDraft={setDraft}
        inputRef={inputRef}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        suggestions={showSuggestions ? suggestions : []}
        onPickSuggestion={(text) => submit(text)}
      />
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────
// Landing state
// ───────────────────────────────────────────────────────────────────

function LandingState({
  draft,
  setDraft,
  inputRef,
  onSubmit,
  onChip,
  onUseExample,
  isLoading,
}: {
  draft: string;
  setDraft: (s: string) => void;
  inputRef: React.RefObject<HTMLTextAreaElement | null>;
  onSubmit: (e: FormEvent) => void;
  onChip: (prompt: string) => void;
  onUseExample: () => void;
  isLoading: boolean;
}) {
  // Focus the composer on first paint, but only on pointer-fine devices
  // — autoFocus on touch yanks the on-screen keyboard up before the user
  // has read the headline.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(hover: none)").matches) return;
    inputRef.current?.focus();
  }, [inputRef]);

  return (
    <div className="relative mx-auto flex w-full max-w-5xl flex-1 flex-col items-center px-5">
      {/* ── Hero ─ claims its own viewport so the trust block is
         guaranteed below the fold. The first visit reads as one
         confident stage, not a stack of sections. */}
      <section className="flex w-full flex-col items-center min-h-[calc(100dvh-3.5rem)] py-10 sm:py-12">
        <div className="flex w-full flex-1 flex-col items-center justify-center">
          <h1 className="text-balance text-center text-[36px] font-medium leading-[1.04] tracking-tight text-foreground sm:text-[52px]">
            What version of yourself are you
            <br className="hidden sm:block" /> working toward?
          </h1>

          <form
            onSubmit={onSubmit}
            className="group relative mt-10 flex w-full max-w-2xl items-end gap-2 rounded-2xl border border-border bg-background p-2 shadow-[0_1px_0_oklch(0_0_0_/_0.03),0_24px_60px_-20px_oklch(0.55_0.22_260/_0.22)] transition-colors focus-within:border-foreground/50"
          >
            <textarea
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  onSubmit(e as unknown as FormEvent);
                }
              }}
              rows={1}
              placeholder="Sleep, focus, recovery, longevity — what are you working on?"
              aria-label="Tell the protocol guide what you're working on"
              autoComplete="off"
              autoCorrect="off"
              className="max-h-40 flex-1 resize-none bg-transparent px-3 py-2.5 text-[16px] leading-relaxed text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
            />
            <button
              type="submit"
              disabled={isLoading || !draft.trim()}
              aria-label="Send"
              className="focus-ring inline-flex h-10 w-10 shrink-0 select-none items-center justify-center rounded-xl bg-foreground text-background transition-opacity hover:opacity-90 disabled:opacity-30"
            >
              <ArrowUp className="h-4 w-4" strokeWidth={2.4} />
            </button>
          </form>

          {/* Goal tiles, anchored to a peptide backbone — primary on-ramp. */}
          <div className="mt-10 w-full">
            {/* Sub-lg fallback eyebrow; the rail carries its own at lg+. */}
            <p className="mb-3 text-center font-mono text-[10.5px] uppercase tracking-[0.18em] text-muted-foreground lg:hidden">
              Jump in by goal
            </p>
            <GoalTileBackbone onSelect={onChip} />
          </div>

        </div>

        {/* Scroll affordance, anchored at the bottom of the hero. */}
        <a
          href="#more"
          aria-label="See clinician and example protocol below"
          className="focus-ring group mt-6 inline-flex select-none flex-col items-center gap-1.5 rounded-md px-3 py-1 text-muted-foreground transition-colors hover:text-foreground"
        >
          <span className="font-mono text-[10px] uppercase tracking-[0.22em]">
            More below
          </span>
          <ChevronDown
            className="h-4 w-4 animate-bounce-soft transition-transform group-hover:translate-y-0.5"
            strokeWidth={1.5}
          />
        </a>
      </section>

      {/* ── Trust + protocol preview ─ the deliberate second chapter. */}
      <section
        id="more"
        className="w-full scroll-mt-20 pb-20 pt-16 sm:pt-24"
      >
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          <ClinicianCard />
          <ProtocolPreview onUseExample={onUseExample} />
        </div>

        <div className="mt-16">
          <div className="mb-4 flex items-baseline justify-between">
            <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-muted-foreground">
              Operators on the protocol
            </p>
            <p className="text-[11.5px] text-muted-foreground">
              Outcomes self-reported · 30-day return on every order
            </p>
          </div>
          <TestimonialStrip />
        </div>
      </section>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────
// Docked composer (used during an active conversation)
// ───────────────────────────────────────────────────────────────────

function DockedComposer({
  draft,
  setDraft,
  inputRef,
  onSubmit,
  isLoading,
  suggestions,
  onPickSuggestion,
}: {
  draft: string;
  setDraft: (s: string) => void;
  inputRef: React.RefObject<HTMLTextAreaElement | null>;
  onSubmit: (e: FormEvent) => void;
  isLoading: boolean;
  suggestions: string[];
  onPickSuggestion: (text: string) => void;
}) {
  return (
    <div className="pointer-events-none sticky bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-background via-background/95 to-transparent pb-6 pt-10">
      <div className="pointer-events-auto mx-auto w-full max-w-3xl px-5">
        {suggestions.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onPickSuggestion(s)}
                className="focus-ring select-none rounded-full border border-border bg-background px-3.5 py-2 text-[13.5px] text-foreground shadow-sm transition-colors hover:border-foreground/40 hover:bg-surface"
              >
                {s}
              </button>
            ))}
          </div>
        )}
        <form
          onSubmit={onSubmit}
          className="group relative flex items-end gap-2 rounded-2xl border border-border bg-background p-2 shadow-[0_1px_0_oklch(0_0_0_/_0.03),0_8px_30px_-12px_oklch(0_0_0_/_0.15)] transition-colors focus-within:border-foreground/50"
        >
          <textarea
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSubmit(e as unknown as FormEvent);
              }
            }}
            rows={1}
            placeholder="Reply…"
            aria-label="Reply to the protocol guide"
            autoComplete="off"
            autoCorrect="off"
            className="max-h-40 flex-1 resize-none bg-transparent px-3 py-2 text-[16px] leading-relaxed text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
          />
          <button
            type="submit"
            disabled={isLoading || !draft.trim()}
            aria-label="Send"
            className="focus-ring inline-flex h-9 w-9 shrink-0 select-none items-center justify-center rounded-xl bg-foreground text-background transition-opacity hover:opacity-90 disabled:opacity-30"
          >
            <ArrowUp className="h-4 w-4" strokeWidth={2.4} />
          </button>
        </form>

        <p className="mt-3 text-center text-[11px] text-muted-foreground">
          Educational only. Not medical advice. Reviewed by Dr. Levin, MD.
        </p>
      </div>
    </div>
  );
}
