import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PRODUCTS } from "@/lib/products";
import { SiteNav } from "@/components/site-nav";
import { SiteBackdrop } from "@/components/backdrop/site-backdrop";
import { ShopAddToCartButton } from "@/components/shop-add-to-cart-button";
import { getUser } from "@/lib/auth";

export const metadata = {
  title: "Shop — Pepwell",
  description:
    "Three short peptides. One protocol. Made in the USA, third-party tested, oral capsules. Browse the full catalog.",
};

export default async function ShopPage() {
  const user = await getUser();
  const single = PRODUCTS.filter((p) => !p.bundle_of);
  const stack = PRODUCTS.find((p) => p.bundle_of);

  return (
    <div className="relative flex min-h-screen flex-col bg-background text-foreground">
      <SiteBackdrop />
      <div className="relative z-10 flex min-h-screen flex-col">
        <SiteNav user={user} />
        <main className="flex-1">
        <section className="mx-auto max-w-5xl px-5 pb-20 pt-14 sm:pt-20">
          <div className="max-w-2xl">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Catalog
            </p>
            <h1 className="mt-3 text-[34px] font-medium leading-[1.05] tracking-tight text-foreground sm:text-[42px]">
              Three peptides. One stack.
            </h1>
            <p className="mt-4 max-w-lg text-[14.5px] leading-relaxed text-muted-foreground">
              Each made in the USA in a cGMP-certified, FDA-registered
              facility. Third-party tested for purity and potency. Oral
              capsule. No injections, no prescription.
            </p>
            <p className="mt-3 text-[12.5px] text-muted-foreground">
              Not sure what to start with?{" "}
              <Link
                href="/"
                className="inline-flex items-center gap-0.5 text-foreground underline-offset-4 hover:underline"
              >
                Talk to the protocol guide
                <ArrowRight className="h-3 w-3" />
              </Link>
            </p>
          </div>

          {stack && (
            <div className="mt-12 rounded-2xl border border-border bg-surface/60 p-1">
              <div className="rounded-[14px] bg-background p-6 sm:p-8">
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <div>
                    <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground">
                      Bundle · Most chosen
                    </p>
                    <h2 className="mt-2 text-[24px] font-medium tracking-tight">
                      {stack.name}
                    </h2>
                  </div>
                  <div className="flex items-baseline gap-2">
                    {stack.compare_price && (
                      <span className="text-[14px] text-muted-foreground line-through">
                        ${stack.compare_price}
                      </span>
                    )}
                    <span className="text-[24px] font-medium tabular-nums">
                      ${stack.price}
                    </span>
                  </div>
                </div>
                <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-muted-foreground">
                  {stack.description}
                </p>
                <p className="mt-3 text-[12.5px] text-muted-foreground">
                  {stack.active} · save $
                  {(stack.compare_price ?? stack.price) - stack.price}
                </p>

                <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center">
                  <ShopAddToCartButton product={stack} primary />
                  <Link
                    href="/"
                    className="inline-flex h-10 items-center justify-center rounded-xl border border-border px-4 text-[13.5px] text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground"
                  >
                    Not sure? Ask the guide
                  </Link>
                </div>
              </div>
            </div>
          )}

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {single.map((p) => (
              <article
                key={p.id}
                className="flex flex-col rounded-2xl border border-border bg-background p-5"
              >
                <div className="flex items-baseline justify-between">
                  <h3 className="text-[18px] font-medium tracking-tight">
                    {p.name}
                  </h3>
                  <span className="text-[16px] font-medium tabular-nums">
                    ${p.price}
                  </span>
                </div>
                <p className="mt-1 text-[12px] text-muted-foreground">
                  {p.active}
                </p>
                <p className="mt-3 text-[13.5px] leading-relaxed text-foreground/80">
                  {p.tag_line}
                </p>
                <p className="mt-3 text-[12.5px] leading-relaxed text-muted-foreground">
                  {p.mechanism}
                </p>

                <ul className="mt-4 space-y-1.5 text-[12.5px] text-muted-foreground">
                  {p.best_for.map((b) => (
                    <li key={b} className="flex gap-2">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-foreground/40" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-5 flex flex-col gap-1.5">
                  <ShopAddToCartButton product={p} />
                </div>
              </article>
            ))}
          </div>

          <div className="mt-12 border-t border-border/60 pt-6 text-[11.5px] leading-relaxed text-muted-foreground">
            These statements have not been evaluated by the Food and Drug
            Administration. These products are not intended to diagnose,
            treat, cure, or prevent any disease. Not for use during pregnancy
            or nursing, or by anyone under 18. Restore BPC contains BPC-157
            which is on the WADA prohibited list — not for athletes subject
            to anti-doping testing.
          </div>
        </section>
        </main>
      </div>
    </div>
  );
}
