"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowUp } from "lucide-react";
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
import { QuickReplyChip, CHIP_ORDER } from "@/components/quick-reply-chip";

const ALLOWED_IDS = new Set(PRODUCTS.map((p) => p.id));

interface ParsedRecommendation {
  body: string;
  ids: string[];
  meta: ProtocolMeta;
}

/**
 * Pulls the structured `protocol` JSON block out of the assistant message
 * and returns the cleaned prose plus the parsed metadata. Tolerant of
 * partial blocks while the response is still streaming.
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
    body = text.replace(/```json[\s\S]*?```/g, "").trim();
  }

  return { body, ids, meta };
}

export function ProtocolChat() {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [draft, setDraft] = useState("");
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
              onCheckout={startCheckout}
            />
          </div>
        </div>

        {/* Mobile: builder inline, after the chat */}
        {protocolProducts.length > 0 && (
          <div className="lg:hidden">
            <ProtocolBuilder
              products={protocolProducts}
              meta={latestProtocol?.meta ?? {}}
              isStreaming={isLoading}
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
  return (
    <div className="relative mx-auto flex w-full max-w-3xl flex-1 flex-col items-center px-5">
      {/* Centered hero + composer */}
      <div className="flex w-full flex-1 flex-col items-center justify-center py-16 sm:py-24">
        <h1 className="text-balance text-center text-[36px] font-medium leading-[1.05] tracking-tight text-foreground sm:text-[48px]">
          What version of yourself are you
          <br className="hidden sm:block" /> working toward?
        </h1>
        <p className="mt-4 max-w-md text-center text-[14.5px] leading-relaxed text-muted-foreground">
          Talk to Dr. Levin&rsquo;s AI guide. She&rsquo;ll route you to the
          smallest peptide protocol that fits, or to none at all.
        </p>

        <form
          onSubmit={onSubmit}
          className="group relative mt-8 flex w-full max-w-2xl items-end gap-2 rounded-2xl border border-border bg-background p-2 shadow-[0_1px_0_oklch(0_0_0_/_0.03),0_24px_60px_-20px_oklch(0.55_0.22_260/_0.25)] transition-colors focus-within:border-foreground/50"
        >
          <textarea
            ref={inputRef}
            autoFocus
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
            className="max-h-40 flex-1 resize-none bg-transparent px-3 py-2.5 text-[15.5px] leading-relaxed text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
          />
          <button
            type="submit"
            disabled={isLoading || !draft.trim()}
            aria-label="Send"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-foreground text-background transition-opacity hover:opacity-90 disabled:opacity-30"
          >
            <ArrowUp className="h-4 w-4" strokeWidth={2.4} />
          </button>
        </form>

        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {CHIP_ORDER.map((c) => (
            <QuickReplyChip key={c} chip={c} onClick={onChip} />
          ))}
        </div>

        <p className="mt-5 text-center text-[11px] text-muted-foreground">
          Educational only. Not medical advice. These statements have not
          been evaluated by the FDA.
        </p>
      </div>

      {/* Trust + protocol preview block, below the fold */}
      <div className="w-full pb-16">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          <ClinicianCard />
          <ProtocolPreview onUseExample={onUseExample} />
        </div>

        <div className="mt-10">
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
      </div>
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
}: {
  draft: string;
  setDraft: (s: string) => void;
  inputRef: React.RefObject<HTMLTextAreaElement | null>;
  onSubmit: (e: FormEvent) => void;
  isLoading: boolean;
}) {
  return (
    <div className="pointer-events-none sticky bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-background via-background/95 to-transparent pb-6 pt-10">
      <div className="pointer-events-auto mx-auto w-full max-w-3xl px-5">
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
            className="max-h-40 flex-1 resize-none bg-transparent px-3 py-2 text-[15px] leading-relaxed text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
          />
          <button
            type="submit"
            disabled={isLoading || !draft.trim()}
            aria-label="Send"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-foreground text-background transition-opacity hover:opacity-90 disabled:opacity-30"
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
