import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { SiteNav } from "@/components/site-nav";
import { ClearCartOnMount } from "@/components/clear-cart-on-mount";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { getUser } from "@/lib/auth";

interface OrderSummary {
  email?: string | null;
  amount?: number | null;
  currency?: string | null;
  lineItems: Array<{ name: string; quantity: number; amount: number }>;
}

async function loadOrder(sessionId: string): Promise<OrderSummary | null> {
  if (!isStripeConfigured()) return null;
  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items"],
    });
    return {
      email: session.customer_details?.email ?? null,
      amount: session.amount_total ? session.amount_total / 100 : null,
      currency: session.currency ?? "usd",
      lineItems:
        session.line_items?.data.map((li) => ({
          name: li.description ?? "Item",
          quantity: li.quantity ?? 1,
          amount: (li.amount_total ?? 0) / 100,
        })) ?? [],
    };
  } catch {
    return null;
  }
}

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;
  const [order, user] = await Promise.all([
    session_id ? loadOrder(session_id) : Promise.resolve(null),
    getUser(),
  ]);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <SiteNav user={user} />
      <ClearCartOnMount />
      <main className="flex flex-1 flex-col items-center px-5 pb-20 pt-16 sm:pt-24">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-foreground text-background">
          <Check className="h-5 w-5" strokeWidth={2.6} />
        </div>
        <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          Order received
        </p>
        <h1 className="mt-2 text-balance text-center text-[28px] font-medium leading-tight tracking-tight sm:text-[34px]">
          You&rsquo;re on the protocol.
        </h1>
        <p className="mx-auto mt-4 max-w-md text-center text-[14px] leading-relaxed text-muted-foreground">
          {order?.email ? (
            <>A confirmation is on its way to <span className="text-foreground">{order.email}</span>. </>
          ) : (
            <>A confirmation is on its way. </>
          )}
          Your first shipment ships in 3-5 business days. Most users report
          changes between weeks 2 and 6 — consistency matters more than dose.
        </p>

        {order && order.lineItems.length > 0 && (
          <div className="mt-10 w-full max-w-md rounded-2xl border border-border bg-background">
            <div className="border-b border-border/60 px-5 py-3">
              <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground">
                Order summary
              </p>
            </div>
            <ul className="divide-y divide-border/60 px-5">
              {order.lineItems.map((li, i) => (
                <li
                  key={i}
                  className="flex items-baseline justify-between py-3 text-[13.5px]"
                >
                  <span className="truncate pr-3">
                    {li.name}
                    {li.quantity > 1 && (
                      <span className="ml-1 text-muted-foreground">
                        × {li.quantity}
                      </span>
                    )}
                  </span>
                  <span className="shrink-0 tabular-nums">
                    ${li.amount.toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
            {order.amount != null && (
              <div className="flex items-center justify-between border-t border-border/60 px-5 py-3 text-[14px] font-medium">
                <span>Total</span>
                <span className="tabular-nums">${order.amount.toFixed(2)}</span>
              </div>
            )}
          </div>
        )}

        <Link
          href="/"
          className="mt-10 inline-flex h-11 items-center justify-center gap-1.5 rounded-xl bg-foreground px-5 text-[13.5px] font-medium text-background transition-opacity hover:opacity-90"
        >
          Back to the guide
          <ArrowRight className="h-4 w-4" />
        </Link>

        <p className="mx-auto mt-10 max-w-md text-center text-[11px] leading-relaxed text-muted-foreground">
          These statements have not been evaluated by the Food and Drug
          Administration. These products are not intended to diagnose, treat,
          cure, or prevent any disease.
        </p>
      </main>
    </div>
  );
}
