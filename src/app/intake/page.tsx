"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useRef, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  Send,
  Stethoscope,
  ShoppingCart,
  CheckCircle2,
  Shield,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useCartStore } from "@/stores/cart-store";
import { createClient } from "@/lib/supabase/client";
import type { Product } from "@/types/database";
import { cn } from "@/lib/utils";

const WELCOME_TEXT =
  "Welcome to your clinical intake. I'll ask a few questions about your goals, training, sleep, and current stack — then build you a personalized protocol from our full catalog (vitamins, performance, nootropics, sleep, longevity, hormones, weight loss, skin & mood).\n\nTo start — what's your top priority right now? For example: build muscle, lose 15 lbs, sleep deeper, sharper focus, lower stress, slow aging, or balance hormones.";

const INITIAL_MESSAGE = {
  id: "welcome",
  role: "assistant" as const,
  content: WELCOME_TEXT,
  parts: [{ type: "text" as const, text: WELCOME_TEXT }],
};

function matchProducts(names: string[], catalog: Product[]): Product[] {
  const matched: Product[] = [];
  const used = new Set<string>();

  for (const name of names) {
    const lower = name.toLowerCase().trim();

    const exact = catalog.find(
      (p) => !used.has(p.id) && p.name.toLowerCase() === lower,
    );
    if (exact) {
      matched.push(exact);
      used.add(exact.id);
      continue;
    }

    const partial = catalog.find(
      (p) =>
        !used.has(p.id) &&
        (p.name.toLowerCase().includes(lower) ||
          lower.includes(p.name.toLowerCase())),
    );
    if (partial) {
      matched.push(partial);
      used.add(partial.id);
    }
  }

  return matched;
}

function extractReasoningAndJson(text: string): {
  reasoning: string;
  names: string[];
} {
  const jsonMatch = text.match(/```json\s*(\{[\s\S]*?\})\s*```/);
  let names: string[] = [];
  let reasoning = text;

  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[1]);
      names = parsed.recommended_products ?? [];
    } catch {
      /* ignore parse errors */
    }
    reasoning = text.replace(/```json\s*\{[\s\S]*?\}\s*```/g, "").trim();
  }

  return { reasoning, names };
}

export default function IntakePage() {
  return (
    <Suspense fallback={null}>
      <IntakePageInner />
    </Suspense>
  );
}

function IntakePageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [recommendedItems, setRecommendedItems] = useState<Product[]>([]);
  const [protocolSaved, setProtocolSaved] = useState(false);
  const [reasoning, setReasoning] = useState("");
  const seedSentRef = useRef(false);
  const setItems = useCartStore((s) => s.setItems);

  useEffect(() => {
    let cancelled = false;
    async function loadProducts() {
      // 2 s budget — if Supabase is unreachable, fall back to bundled mock catalog.
      const ctl = new AbortController();
      const timeout = setTimeout(() => ctl.abort(), 2000);
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from("products")
          .select("*")
          .abortSignal(ctl.signal);
        clearTimeout(timeout);
        if (!cancelled && data && data.length > 0) {
          setProducts(data);
          return;
        }
      } catch {
        clearTimeout(timeout);
      }
      // Fallback: bundled mock catalog so AI recommendations still resolve.
      if (!cancelled) {
        const { MOCK_PRODUCTS } = await import("@/lib/mock-data");
        setProducts(MOCK_PRODUCTS);
      }
    }
    loadProducts();
    return () => {
      cancelled = true;
    };
  }, []);

  const saveProtocol = useCallback(async (items: Product[]) => {
    try {
      await fetch("/api/protocol", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productIds: items.map((p) => p.id),
        }),
      });
      setProtocolSaved(true);
    } catch {
      /* best-effort save */
    }
  }, []);

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat/intake" }),
    messages: [INITIAL_MESSAGE],
    onFinish({ message }) {
      const fullText =
        message.parts
          ?.filter(
            (p): p is { type: "text"; text: string } => p.type === "text",
          )
          .map((p) => p.text)
          .join("") ?? "";

      const { reasoning: extractedReasoning, names } =
        extractReasoningAndJson(fullText);

      if (names.length > 0) {
        const matched = matchProducts(names, products);
        if (matched.length > 0) {
          setRecommendedItems(matched);
          setReasoning(extractedReasoning);
          saveProtocol(matched);
        }
      }
    },
  });

  const isLoading = status === "submitted" || status === "streaming";

  /* Auto-send a seed prompt forwarded from the home-page hero */
  useEffect(() => {
    if (seedSentRef.current) return;
    let seed = searchParams.get("q") ?? "";
    if (!seed) {
      try {
        seed = sessionStorage.getItem("medicine.intake.seed") ?? "";
      } catch {
        /* ignore */
      }
    }
    if (seed.trim()) {
      seedSentRef.current = true;
      try {
        sessionStorage.removeItem("medicine.intake.seed");
      } catch {
        /* ignore */
      }
      sendMessage({ text: seed.trim() });
    }
  }, [searchParams, sendMessage]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, recommendedItems]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = inputValue.trim();
    if (!text || isLoading) return;
    setInputValue("");
    sendMessage({ text });
  }

  function handleAddToCart() {
    setItems(recommendedItems);
    router.push("/checkout");
  }

  function getDisplayText(message: (typeof messages)[number]): string {
    const raw =
      message.parts
        ?.filter(
          (p): p is { type: "text"; text: string } => p.type === "text",
        )
        .map((p) => p.text)
        .join("") ?? "";

    return raw.replace(/```json\s*\{[\s\S]*?\}\s*```/g, "").trim();
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Header */}
      <header className="shrink-0 border-b border-border/60 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-5">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-[15px] font-semibold tracking-tight text-foreground"
            >
              medicine
            </Link>
            <span className="hidden items-center gap-2 text-[12px] text-muted-foreground sm:inline-flex">
              <span className="h-3 w-px bg-border" />
              <Sparkles className="h-3 w-3 text-primary" />
              AI Protocol Intake
            </span>
          </div>
          {recommendedItems.length > 0 && (
            <Button
              onClick={handleAddToCart}
              size="sm"
              className="h-9 rounded-full"
            >
              <ShoppingCart className="mr-1.5 h-3.5 w-3.5" />
              Review Cart ({recommendedItems.length})
            </Button>
          )}
        </div>
      </header>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-4 py-8 space-y-5">
          {messages.map((message) => {
            const isAssistant = message.role === "assistant";
            const text = getDisplayText(message);
            if (!text) return null;

            return (
              <div
                key={message.id}
                className={cn(
                  "flex gap-3",
                  !isAssistant && "flex-row-reverse",
                )}
              >
                {isAssistant && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Stethoscope className="h-4 w-4" />
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[75%] rounded-xl px-4 py-3 text-[0.9rem] leading-relaxed whitespace-pre-wrap",
                    isAssistant
                      ? "bg-card border text-card-foreground"
                      : "bg-primary text-primary-foreground",
                  )}
                >
                  {text}
                </div>
              </div>
            );
          })}

          {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Stethoscope className="h-4 w-4" />
              </div>
              <div className="rounded-xl border bg-card px-4 py-3">
                <div className="flex gap-1.5">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:0ms]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:150ms]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          )}

          {/* Protocol Recommendation Card */}
          {recommendedItems.length > 0 && (
            <Card className="mx-auto max-w-lg border-primary/20 p-0 overflow-hidden">
              <div className="border-b bg-primary/5 px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-semibold">
                    Your Personalized Protocol
                  </h3>
                </div>
                {protocolSaved && (
                  <span className="flex items-center gap-1 text-xs text-emerald-600">
                    <CheckCircle2 className="h-3 w-3" />
                    Saved
                  </span>
                )}
              </div>

              {reasoning && (
                <div className="px-5 py-3 border-b bg-muted/30">
                  <p className="text-xs leading-relaxed text-muted-foreground whitespace-pre-wrap">
                    {reasoning.length > 600
                      ? reasoning.slice(0, 600) + "…"
                      : reasoning}
                  </p>
                </div>
              )}

              <div className="px-5 py-4">
                <ul className="space-y-3">
                  {recommendedItems.map((product) => (
                    <li key={product.id} className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
                        {product.type === "Rx" ? (
                          <Shield className="h-3 w-3 text-amber-500" />
                        ) : (
                          <CheckCircle2 className="h-3 w-3 text-primary" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between gap-2">
                          <p className="text-sm font-medium">{product.name}</p>
                          <p className="text-sm font-semibold tabular-nums shrink-0">
                            ${product.price.toFixed(2)}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {product.tag_line ||
                            (product.type === "Rx"
                              ? "Prescription — requires approval"
                              : product.category)}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="mt-4 flex items-center justify-between border-t pt-4">
                  <p className="text-sm font-medium text-muted-foreground">
                    Monthly total
                  </p>
                  <p className="text-lg font-semibold tabular-nums">
                    $
                    {recommendedItems
                      .reduce((s, p) => s + p.price, 0)
                      .toFixed(2)}
                  </p>
                </div>

                <Button
                  onClick={handleAddToCart}
                  className="mt-4 w-full"
                  size="lg"
                >
                  Proceed to Checkout
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Input */}
      <div className="shrink-0 border-t bg-card">
        <form
          onSubmit={handleSubmit}
          className="mx-auto flex max-w-3xl items-center gap-2 px-4 py-3"
        >
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your response…"
            disabled={isLoading}
            className="flex-1 bg-background"
          />
          <Button
            type="submit"
            size="icon"
            disabled={isLoading || !inputValue.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
