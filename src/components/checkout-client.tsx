"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowRight, Loader2, Minus, Plus, X } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { useMounted } from "@/lib/use-mounted";

export function CheckoutClient() {
  return (
    <Suspense fallback={<CheckoutShellLoading />}>
      <CheckoutInner />
    </Suspense>
  );
}

function CheckoutShellLoading() {
  return (
    <div className="mx-auto max-w-xl px-5 pb-20 pt-12 sm:pt-16">
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
        Checkout
      </p>
      <div className="mt-10 flex items-center gap-2 text-[13.5px] text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading cart…
      </div>
    </div>
  );
}

function CheckoutInner() {
  const mounted = useMounted();
  const searchParams = useSearchParams();
  const canceled = searchParams.get("canceled");

  const items = useCartStore((s) => s.items);
  const total = useCartStore((s) => s.total());
  const setQuantity = useCartStore((s) => s.setQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function startCheckout() {
    if (items.length === 0 || pending) return;
    setError(null);
    setPending(true);
    try {
      const res = await fetch("/api/checkout/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            id: i.product.id,
            quantity: i.quantity,
          })),
        }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        setError(data.error ?? "Could not start Stripe checkout.");
        setPending(false);
        return;
      }
      window.location.href = data.url;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not reach the server.",
      );
      setPending(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl px-5 pb-20 pt-12 sm:pt-16">
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
        Checkout
      </p>
      <h1 className="mt-3 text-[28px] font-medium tracking-tight">
        Review your protocol
      </h1>

      {canceled && (
        <div className="mt-5 rounded-xl border border-amber-300/60 bg-amber-50/50 px-4 py-3 text-[13px] text-amber-900">
          Payment canceled. Your cart is still here when you&rsquo;re ready.
        </div>
      )}

      {!mounted ? (
        <div className="mt-10 flex items-center gap-2 text-[13.5px] text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading cart…
        </div>
      ) : items.length === 0 ? (
        <EmptyCart />
      ) : (
        <>
          <ul className="mt-8 divide-y divide-border/60 rounded-2xl border border-border bg-background">
            {items.map(({ product, quantity }) => (
              <li
                key={product.id}
                className="flex items-start gap-4 px-5 py-4"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="truncate text-[14.5px] font-medium">
                      {product.name}
                    </p>
                    <p className="shrink-0 text-[14px] font-medium tabular-nums">
                      ${(product.price * quantity).toFixed(0)}
                    </p>
                  </div>
                  <p className="mt-0.5 text-[12px] text-muted-foreground">
                    {product.active}
                  </p>

                  <div className="mt-3 flex items-center gap-4">
                    <div className="inline-flex items-center rounded-full border border-border text-[12.5px]">
                      <button
                        type="button"
                        onClick={() =>
                          setQuantity(product.id, quantity - 1)
                        }
                        className="inline-flex h-7 w-7 items-center justify-center rounded-l-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-6 text-center tabular-nums">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setQuantity(product.id, quantity + 1)
                        }
                        className="inline-flex h-7 w-7 items-center justify-center rounded-r-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(product.id)}
                      className="inline-flex items-center gap-1 text-[12px] text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <X className="h-3 w-3" /> Remove
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-5 flex items-center justify-between border-t border-border/60 pt-5">
            <span className="text-[13px] text-muted-foreground">Total</span>
            <span className="text-[20px] font-medium tabular-nums">
              ${total.toFixed(0)}
            </span>
          </div>

          {error && (
            <div className="mt-4 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-[13px] text-destructive">
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={startCheckout}
            disabled={pending}
            className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-foreground text-[14px] font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {pending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Redirecting to
                Stripe…
              </>
            ) : (
              <>
                Pay securely with Stripe
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>

          <p className="mt-3 text-center text-[11.5px] leading-relaxed text-muted-foreground">
            You&rsquo;ll be redirected to Stripe&rsquo;s secure checkout.
            Use test card{" "}
            <span className="font-mono">4242 4242 4242 4242</span>, any
            future date, any CVC, any ZIP.
          </p>
        </>
      )}
    </div>
  );
}

function EmptyCart() {
  return (
    <div className="mt-10 rounded-2xl border border-border bg-background px-6 py-10 text-center">
      <h2 className="text-[16px] font-medium">Your cart is empty.</h2>
      <p className="mx-auto mt-2 max-w-sm text-[13.5px] text-muted-foreground">
        Talk to the protocol guide, or browse the catalog directly.
      </p>
      <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
        <Link
          href="/"
          className="inline-flex h-10 items-center justify-center rounded-xl bg-foreground px-5 text-[13.5px] font-medium text-background transition-opacity hover:opacity-90"
        >
          Talk to the guide
        </Link>
        <Link
          href="/shop"
          className="inline-flex h-10 items-center justify-center rounded-xl border border-border px-5 text-[13.5px] text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground"
        >
          Shop directly
        </Link>
      </div>
    </div>
  );
}
