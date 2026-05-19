"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowUp, Plus, Check } from "lucide-react";
import { PRODUCTS, getProduct, type ProtocolProduct } from "@/lib/products";
import { useCartStore } from "@/stores/cart-store";
import { cn } from "@/lib/utils";

const SUGGESTIONS = [
  "I can't sleep through the night.",
  "Brain fog has gotten bad.",
  "I want to age slower — what should I start with?",
  "Recovering from surgery. What helps?",
];

const ALLOWED_IDS = new Set(PRODUCTS.map((p) => p.id));

function extractRecommendation(text: string): {
  body: string;
  ids: string[];
} {
  const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
  let ids: string[] = [];
  let body = text;

  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[1]);
      const raw = parsed.recommended_product_ids ?? parsed.recommended_products ?? [];
      ids = (Array.isArray(raw) ? raw : [])
        .map((id: unknown) => String(id).toLowerCase().trim())
        .filter((id: string) => ALLOWED_IDS.has(id));
    } catch {
      /* ignore */
    }
    body = text.replace(/```json[\s\S]*?```/g, "").trim();
  }

  return { body, ids };
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

  function startCheckout(products: ProtocolProduct[]) {
    setItems(products);
    router.push("/checkout");
  }

  return (
    <div className="relative flex flex-1 flex-col">
      {/* ───── Conversation column ───── */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto"
      >
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-5 pb-48 pt-12 sm:pt-20">
          {!hasConversation && (
            <div className="flex flex-col items-center text-center">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                Pepwell · your AI protocol
              </p>
              <h1 className="mt-5 text-balance text-[34px] font-medium leading-[1.1] tracking-tight text-foreground sm:text-[42px]">
                What&rsquo;s the thing your body
                <br className="hidden sm:block" /> wishes it wasn&rsquo;t doing?
              </h1>
              <p className="mt-4 max-w-md text-[14.5px] leading-relaxed text-muted-foreground">
                Three short-chain peptides, one protocol. Tell me what&rsquo;s
                actually going on. I&rsquo;ll route you to the right one.
              </p>
            </div>
          )}

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

            const { body, ids } = extractRecommendation(raw);
            const products = ids
              .map((id) => getProduct(id))
              .filter((p): p is ProtocolProduct => Boolean(p));

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

                {products.length > 0 && (
                  <RecommendationCard
                    products={products}
                    onCheckout={() => startCheckout(products)}
                  />
                )}
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
      </div>

      {/* ───── Composer ───── */}
      <div className="pointer-events-none sticky bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-background via-background/95 to-transparent pb-6 pt-10">
        <div className="pointer-events-auto mx-auto w-full max-w-2xl px-5">
          {!hasConversation && (
            <div className="mb-4 flex flex-wrap justify-center gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => submit(s)}
                  className="rounded-full border border-border/80 bg-background/80 px-3 py-1.5 text-[12.5px] text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="group relative flex items-end gap-2 rounded-2xl border border-border bg-background p-2 shadow-[0_1px_0_oklch(0_0_0_/_0.03),0_8px_30px_-12px_oklch(0_0_0_/_0.15)] transition-colors focus-within:border-foreground/50"
          >
            <textarea
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  submit();
                }
              }}
              rows={1}
              placeholder={
                hasConversation
                  ? "Reply…"
                  : "Tell me what is going on — sleep, focus, recovery, longevity…"
              }
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
            Educational only. Not medical advice. These statements have not
            been evaluated by the FDA.
          </p>
        </div>
      </div>
    </div>
  );
}

function RecommendationCard({
  products,
  onCheckout,
}: {
  products: ProtocolProduct[];
  onCheckout: () => void;
}) {
  const subtotal = products.reduce((s, p) => s + p.price, 0);

  return (
    <div className="mt-5 w-full max-w-md rounded-2xl border border-border bg-surface/60 p-1">
      <div className="rounded-[14px] bg-background px-4 pb-4 pt-3.5">
        <div className="flex items-center justify-between">
          <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground">
            Recommended protocol
          </p>
          <Check className="h-3.5 w-3.5 text-foreground" />
        </div>

        <ul className="mt-3 divide-y divide-border/60">
          {products.map((p) => (
            <li
              key={p.id}
              className="flex items-baseline justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
            >
              <div className="min-w-0">
                <p className="text-[14px] font-medium text-foreground">
                  {p.name}
                </p>
                <p className="mt-0.5 truncate text-[12px] text-muted-foreground">
                  {p.active}
                </p>
              </div>
              <p className="shrink-0 text-[13.5px] font-medium tabular-nums text-foreground">
                ${p.price}
              </p>
            </li>
          ))}
        </ul>

        <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-3">
          <span className="text-[12.5px] text-muted-foreground">Subtotal</span>
          <span className="text-[14px] font-semibold tabular-nums text-foreground">
            ${subtotal}
          </span>
        </div>

        <button
          type="button"
          onClick={onCheckout}
          className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-foreground py-2.5 text-[13.5px] font-medium text-background transition-opacity hover:opacity-90"
        >
          <Plus className="h-3.5 w-3.5" />
          Add to cart & check out
        </button>
      </div>
    </div>
  );
}
