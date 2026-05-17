import { NextResponse } from "next/server";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { getProduct } from "@/lib/products";

interface IncomingItem {
  id: string;
  quantity?: number;
}

export async function POST(req: Request) {
  if (!isStripeConfigured()) {
    return NextResponse.json(
      {
        error:
          "Stripe is not configured. Add STRIPE_SECRET_KEY (sk_test_…) to .env.local and restart the dev server.",
      },
      { status: 500 },
    );
  }

  let body: { items?: IncomingItem[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const items = body.items ?? [];
  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "Cart is empty." }, { status: 400 });
  }

  const lineItems = items
    .map((item) => {
      const product = getProduct(item.id);
      if (!product) return null;
      const quantity = Math.max(1, Math.min(10, item.quantity ?? 1));
      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: product.name,
            description: product.tag_line,
            metadata: { protocol_id: product.id },
          },
          unit_amount: Math.round(product.price * 100),
        },
        quantity,
      };
    })
    .filter(Boolean) as Array<{
    price_data: {
      currency: string;
      product_data: { name: string; description: string; metadata: Record<string, string> };
      unit_amount: number;
    };
    quantity: number;
  }>;

  if (lineItems.length === 0) {
    return NextResponse.json(
      { error: "No matching products in cart." },
      { status: 400 },
    );
  }

  const origin =
    process.env.NEXT_PUBLIC_BASE_URL ||
    req.headers.get("origin") ||
    new URL(req.url).origin;

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      allow_promotion_codes: true,
      shipping_address_collection: { allowed_countries: ["US"] },
      automatic_tax: { enabled: false },
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout?canceled=1`,
      metadata: {
        cart: JSON.stringify(
          items.map((i) => ({ id: i.id, quantity: i.quantity ?? 1 })),
        ),
      },
    });

    return NextResponse.json({ id: session.id, url: session.url });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Stripe session create failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
