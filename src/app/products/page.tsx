import { Suspense } from "react";
import { Check } from "lucide-react";
import { getProducts } from "@/lib/supabase/safe";
import { SiteHeader } from "@/components/site-header";
import { ProductCard } from "@/components/product-card";
import { CATEGORY_LIST, getCategoryBySlug } from "@/lib/categories";
import type { ProductCategory } from "@/types/database";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category: categorySlug } = await searchParams;
  const allProducts = await getProducts();

  const activeCategory = categorySlug
    ? getCategoryBySlug(categorySlug)
    : undefined;
  const activeCategoryKey = activeCategory?.[0] as ProductCategory | undefined;
  const activeMeta = activeCategory?.[1];

  const filtered = activeCategoryKey
    ? allProducts.filter((p) => p.category === activeCategoryKey)
    : allProducts;

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1">
        {/* ─── Page header ─── */}
        <section className="border-b border-border/60 bg-surface py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
              Protocols
            </p>
            <div className="mt-4 grid gap-8 lg:grid-cols-[2fr_1fr] lg:items-end">
              <div>
                <h1 className="text-balance text-[44px] font-semibold leading-[1.05] tracking-tight sm:text-[56px]">
                  {activeCategoryKey ? activeMeta?.label : "Everything we offer"}
                </h1>
                <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
                  {activeMeta?.description ??
                    `${allProducts.length} products across ${CATEGORY_LIST.length} categories — vitamins, performance powders, nootropics, sleep, longevity, hormones, weight loss, and skin & mood. Each reviewed by our care team before it ships.`}
                </p>
                <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-[12px] text-muted-foreground">
                  {[
                    "HSA/FSA eligible",
                    "Third-party tested",
                    "Free shipping",
                    "From $69/mo",
                  ].map((item) => (
                    <span
                      key={item}
                      className="inline-flex items-center gap-1.5"
                    >
                      <Check className="h-3 w-3 text-primary" />
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Stats strip ─── */}
        <section className="border-b border-border/60 bg-background py-10">
          <div className="mx-auto grid max-w-7xl gap-8 px-5 sm:grid-cols-3 sm:px-8">
            {[
              ["85%", "of members report noticeable improvement within 8 weeks"],
              ["96%", "average adherence across active members"],
              ["9 in 10", "members say it's simpler than going it alone"],
            ].map(([s, l]) => (
              <div key={s}>
                <p className="text-[28px] font-semibold tracking-tight text-foreground sm:text-[34px]">
                  {s}
                </p>
                <p className="mt-1 max-w-[40ch] text-[12.5px] leading-relaxed text-muted-foreground">
                  {l}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── Category pills ─── */}
        <section className="sticky top-16 z-30 border-b border-border/60 bg-background/85 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center gap-2 overflow-x-auto px-5 py-4 sm:px-8">
            <Link href="/products">
              <span
                className={cn(
                  "inline-flex h-9 items-center whitespace-nowrap rounded-full px-4 text-[12.5px] font-medium transition-colors",
                  !categorySlug
                    ? "bg-foreground text-background"
                    : "border border-border bg-background text-foreground/70 hover:border-foreground/30 hover:text-foreground",
                )}
              >
                All
              </span>
            </Link>
            {CATEGORY_LIST.map(([key, meta]) => (
              <Link key={key} href={`/products?category=${meta.slug}`}>
                <span
                  className={cn(
                    "inline-flex h-9 items-center whitespace-nowrap rounded-full px-4 text-[12.5px] font-medium transition-colors",
                    categorySlug === meta.slug
                      ? "bg-foreground text-background"
                      : "border border-border bg-background text-foreground/70 hover:border-foreground/30 hover:text-foreground",
                  )}
                >
                  {meta.label}
                </span>
              </Link>
            ))}
            <span className="ml-auto whitespace-nowrap text-[12px] text-muted-foreground">
              {filtered.length} protocol{filtered.length !== 1 && "s"}
            </span>
          </div>
        </section>

        {/* ─── Product grid ─── */}
        <section className="bg-background py-14">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <Suspense>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </Suspense>

            {filtered.length === 0 && (
              <div className="py-20 text-center">
                <p className="text-[14px] text-muted-foreground">
                  No protocols in this category yet.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
