import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Shield,
  ShieldCheck,
  Truck,
  Stethoscope,
  Beaker,
  Check,
} from "lucide-react";
import { getProduct, getRelatedProducts } from "@/lib/supabase/safe";
import { SiteHeader } from "@/components/site-header";
import { AddToCartButton } from "@/components/add-to-cart-button";
import {
  ProductCard,
  ProductIllustration,
  productFormat,
} from "@/components/product-card";
import type { ProductCategory } from "@/types/database";
import { CATEGORIES } from "@/lib/categories";

const PEPTIDE_CODES: Record<string, string> = {
  Foundational: "FND",
  "Athletic Performance": "PERF",
  Cognitive: "NTRO",
  "Sleep & Recovery": "RPR",
  Longevity: "LNG",
  Hormones: "HRM",
  "Weight Management": "GLP-1",
  "Stress & Mood": "MOOD",
};

function compoundCode(name: string, category: string) {
  const known = name.match(
    /\b(BPC[- ]?157|TB[- ]?500|GLP[- ]?1|GHK[- ]?Cu|NMN|NAD\+?|CoQ10|HMB|MOTS[- ]?C|GHRP[- ]?6|CJC[- ]?1295|Ipamorelin|Tirzepatide|Semaglutide|Enclomiphene|DHEA|Apigenin|EGCG|EAA|BCAA|KSM[- ]?66)\b/i,
  );
  if (known) return known[0].toUpperCase().replace(/\s/g, "-");
  return PEPTIDE_CODES[category] ?? "RX";
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const product = await getProduct(id);
  if (!product) notFound();

  const catMeta = CATEGORIES[product.category as ProductCategory];
  const code = compoundCode(product.name, product.category);

  const relatedProducts = await getRelatedProducts(product.category, product.id, 3);
  const fmt = productFormat(product);

  const facts = [
    { icon: ShieldCheck, label: "Pharma-grade API", sub: "FDA-listed manufacturer" },
    { icon: Stethoscope, label: "Clinician reviewed", sub: "Every order signed off" },
    { icon: Truck, label: "Free monthly shipping", sub: "Cold-chain when needed" },
    { icon: Beaker, label: "Third-party tested", sub: "Purity, sterility, endotoxins" },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1 bg-background">
        <div className="mx-auto max-w-7xl px-5 pb-20 pt-10 sm:px-8">
          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 text-[12.5px] text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            All protocols
          </Link>

          <div className="mt-8 grid gap-12 lg:grid-cols-[1fr_1fr] lg:items-start">
            {/* ─── Product visual ─── */}
            <div className="group relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-stone-100 via-neutral-50 to-stone-200 aspect-square">
              <div
                className={`absolute inset-0 bg-gradient-to-tr ${catMeta?.accent ?? "from-blue-500/15 via-sky-400/10 to-cyan-500/5"}`}
              />
              <div className="absolute inset-0 bg-noise opacity-30 mix-blend-overlay" />
              <div className="absolute bottom-12 left-1/2 h-5 w-56 -translate-x-1/2 rounded-full bg-black/15 blur-md" />

              <div className="absolute inset-0 flex items-center justify-center">
                <ProductIllustration
                  product={product}
                  format={fmt}
                  code={code}
                  size={260}
                />
              </div>
            </div>

            {/* ─── Details ─── */}
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/products?category=${catMeta?.slug ?? ""}`}
                  className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-primary hover:text-primary/80"
                >
                  {catMeta?.label ?? product.category}
                </Link>
                {product.type === "Rx" && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-foreground/85 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-background">
                    <Shield className="h-2.5 w-2.5" />
                    Rx
                  </span>
                )}
              </div>

              <h1 className="mt-3 text-[40px] font-semibold leading-[1.05] tracking-tight">
                {product.name.split(" (")[0]}
              </h1>
              <p className="mt-2 font-mono text-[12px] uppercase tracking-[0.18em] text-muted-foreground">
                {code}
              </p>

              {product.tag_line && (
                <p className="mt-6 text-[17px] leading-relaxed text-foreground/80">
                  {product.tag_line}
                </p>
              )}

              <p className="mt-4 text-[14px] leading-relaxed text-muted-foreground">
                {product.description}
              </p>

              {product.type === "Rx" && (
                <div className="mt-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50/60 px-4 py-3.5">
                  <Shield className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                  <p className="text-[12.5px] leading-relaxed text-amber-900">
                    Requires physician review. Complete a brief clinical
                    intake at checkout — usually approved within 24 hours.
                  </p>
                </div>
              )}

              {/* Price + CTA */}
              <div className="mt-8 flex items-end justify-between gap-6 border-t border-border/60 pt-6">
                <div>
                  <p className="text-[36px] font-semibold tabular-nums tracking-tight">
                    ${Math.round(product.price)}
                    <span className="text-[14px] font-normal text-muted-foreground">
                      /mo
                    </span>
                  </p>
                  <p className="text-[12px] text-muted-foreground">
                    Billed monthly · cancel anytime
                  </p>
                </div>
                <AddToCartButton product={product} />
              </div>

              {/* Trust facts */}
              <div className="mt-8 grid grid-cols-2 gap-3">
                {facts.map((f) => (
                  <div
                    key={f.label}
                    className="flex items-start gap-2.5 rounded-xl border border-border/60 bg-card px-3 py-2.5"
                  >
                    <f.icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <div>
                      <p className="text-[12.5px] font-medium text-foreground">
                        {f.label}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {f.sub}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-[12px] text-muted-foreground">
                {[
                  "HSA/FSA eligible",
                  "Care team in-app",
                  "Free shipping",
                  "Pharma-grade",
                ].map((item) => (
                  <span key={item} className="inline-flex items-center gap-1.5">
                    <Check className="h-3 w-3 text-emerald-500" />
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* ─── Related ─── */}
          {relatedProducts.length > 0 && (
            <section className="mt-24">
              <div className="flex items-end justify-between">
                <h2 className="text-[24px] font-semibold tracking-tight">
                  More in {catMeta?.label ?? product.category}
                </h2>
                <Link
                  href={`/products?category=${catMeta?.slug ?? ""}`}
                  className="text-[12.5px] font-medium text-primary hover:text-primary/80"
                >
                  See all →
                </Link>
              </div>
              <div className="mt-6 grid gap-6 sm:grid-cols-3">
                {relatedProducts.map((rp) => (
                  <ProductCard key={rp.id} product={rp} layout="compact" />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
