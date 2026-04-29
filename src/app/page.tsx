import Link from "next/link";
import {
  ArrowRight,
  Check,
  X,
  Sparkles,
  ShieldCheck,
  Truck,
  Globe,
  Beaker,
  Microscope,
  Stethoscope,
  HeartPulse,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site-header";
import { getProducts } from "@/lib/supabase/safe";
import { ProductCard } from "@/components/product-card";
import { AiIntakePrompt } from "@/components/ai-intake-prompt";
import { DashboardPreview } from "@/components/dashboard-preview";
import type { Product } from "@/types/database";
import { CATEGORY_LIST } from "@/lib/categories";

const TRUST_ITEMS = [
  { icon: Globe, label: "Pharmacist-dispensed" },
  { icon: ShieldCheck, label: "Third-party tested" },
  { icon: Truck, label: "Free shipping" },
  { icon: Stethoscope, label: "Care team reviewed" },
  { icon: HeartPulse, label: "HSA/FSA eligible" },
  { icon: Beaker, label: "Pharma-grade" },
  { icon: Microscope, label: "Single-source API" },
];

export default async function Home() {
  const allProducts = await getProducts();

  // 6 representative protocols for the "everything we offer" preview
  const featured = pickFeatured(allProducts, 6);

  // Group products by category for the offer-list section
  const byCategory = CATEGORY_LIST.map(([key, meta]) => ({
    key,
    meta,
    products: allProducts.filter((p) => p.category === key).slice(0, 2),
  })).filter((g) => g.products.length > 0);

  return (
    <div className="flex min-h-screen flex-col">
      {/* ─────────────────────────────────────────────────────────
          HERO — dark, atmospheric, AI prompt as primary CTA
         ───────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-hero text-hero-foreground">
        {/* Atmospheric layered gradient (no photo, but feels cinematic) */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(120,170,255,0.18)_0%,transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_85%_30%,rgba(70,90,180,0.25)_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_15%_80%,rgba(40,60,140,0.20)_0%,transparent_55%)]" />
        <div className="absolute inset-0 bg-grid-faint opacity-50" />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-b from-transparent to-background/30" />

        <SiteHeader variant="transparent" />

        <div className="relative mx-auto max-w-7xl px-5 pb-28 pt-24 sm:px-8 sm:pt-32 lg:pt-36">
          <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
            <div className="animate-fade-in inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[12px] text-white/70 backdrop-blur">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-emerald-400" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-300" />
              </span>
              Now: AI-built wellness protocols, reviewed by clinicians
            </div>

            <h1 className="animate-fade-in-up mt-6 text-balance text-[44px] font-semibold leading-[1.05] tracking-[-0.02em] sm:text-[64px] lg:text-[76px]">
              The future of{" "}
              <span className="italic text-white/80">medicine</span> starts
              here.
            </h1>

            <p className="animate-fade-in-up-delay mt-7 max-w-xl text-[16px] leading-relaxed text-hero-muted sm:text-[17px]">
              The one-stop shop for wellness. From your daily creatine to
              GLP-1s and Rx peptides — every protocol personalized by AI,
              reviewed by our care team, and shipped monthly.
            </p>

            {/* AI intake prompt — the new primary CTA */}
            <div className="animate-fade-in-up-delay-2 mt-10 w-full">
              <div className="mx-auto flex justify-center">
                <AiIntakePrompt variant="dark" />
              </div>
            </div>

            <div className="animate-fade-in-up-delay-3 mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[12px] text-white/55">
              <span className="inline-flex items-center gap-1.5">
                <Check className="h-3 w-3 text-emerald-300" />
                Avg protocol from $69/mo
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Check className="h-3 w-3 text-emerald-300" />
                Care team reviews every order
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Check className="h-3 w-3 text-emerald-300" />
                Cancel anytime
              </span>
            </div>
          </div>

          {/* Floating category tiles, derive-style */}
          <div className="animate-fade-in-up-delay-3 mt-20 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {CATEGORY_LIST.slice(0, 4).map(([key, meta]) => {
              const Icon = meta.icon;
              return (
                <Link
                  key={key}
                  href={`/products?category=${meta.slug}`}
                  className="group flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-md transition-all hover:border-white/25 hover:bg-white/[0.10]"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white">
                      <Icon className="h-[18px] w-[18px]" />
                    </div>
                    <div>
                      <p className="text-[13.5px] font-medium text-white">
                        {meta.label}
                      </p>
                      <p className="text-[11px] text-white/45">{meta.short}</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-white/40 transition-all group-hover:translate-x-0.5 group-hover:text-white" />
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <main className="flex-1">
        {/* ─────────────────────────────────────────────────────────
            STATS — three-column, derive-blue numbers
           ───────────────────────────────────────────────────────── */}
        <section className="border-y border-border/60 bg-surface py-16 sm:py-20">
          <div className="mx-auto grid max-w-6xl gap-10 px-5 sm:grid-cols-3 sm:px-8">
            {[
              {
                stat: "85%",
                label:
                  "of members report noticeable improvement within 8 weeks of starting a protocol",
              },
              {
                stat: "96%",
                label:
                  "average adherence across active members — because we make it easy to stay consistent",
              },
              {
                stat: "9 in 10",
                label:
                  "members say medicine is simpler than navigating peptides on their own",
              },
            ].map((s) => (
              <div key={s.stat}>
                <p className="text-[44px] font-semibold tracking-tight text-primary sm:text-[52px]">
                  {s.stat}
                </p>
                <p className="mt-2 max-w-[28ch] text-[13.5px] leading-relaxed text-muted-foreground">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────
            PEPTIDES EXPLAINER + DASHBOARD PREVIEW
           ───────────────────────────────────────────────────────── */}
        <section className="bg-background py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                Performance medicine
              </p>
              <h2 className="mt-4 text-balance text-[36px] font-semibold tracking-tight text-foreground sm:text-[48px]">
                Your whole stack, in one place.
              </h2>
              <p className="mt-5 text-[15.5px] leading-relaxed text-muted-foreground">
                Vitamins, performance powders, nootropics, peptides and
                Rx compounds — under one dashboard, reviewed by our care
                team and shipped monthly.
              </p>
              <Link
                href="/products"
                className="mt-5 inline-flex items-center gap-1 text-[13.5px] font-medium text-primary hover:text-primary/80"
              >
                Explore all protocols <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="mt-16">
              <DashboardPreview />
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────
            HOW IT WORKS — three colorful tiles
           ───────────────────────────────────────────────────────── */}
        <section
          id="how-it-works"
          className="border-t border-border/60 bg-background py-24 sm:py-28"
        >
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <div className="text-center">
              <h2 className="text-[34px] font-semibold tracking-tight text-foreground sm:text-[40px]">
                How it works
              </h2>
              <p className="mx-auto mt-3 max-w-lg text-[14.5px] text-muted-foreground">
                Three steps from goal to delivered protocol.
              </p>
            </div>

            <div className="mt-14 grid gap-6 sm:grid-cols-3">
              {[
                {
                  n: "01",
                  title: "Tell our AI about you",
                  body: "Share your goals, history, and constraints. Takes about 3 minutes — natural conversation, not a form.",
                  swatch: "from-rose-400 via-amber-300 to-orange-400",
                },
                {
                  n: "02",
                  title: "Care team reviews",
                  body: "A licensed clinician reviews your profile, signs off, and personalizes dosing for your biology.",
                  swatch: "from-violet-500 via-fuchsia-400 to-pink-400",
                },
                {
                  n: "03",
                  title: "Protocol arrives",
                  body: "Pharmacy-compounded vials shipped monthly with a personalized dosing guide and care team support.",
                  swatch: "from-blue-500 via-indigo-400 to-violet-500",
                },
              ].map((s) => (
                <div
                  key={s.n}
                  className="group overflow-hidden rounded-3xl border border-border/60 bg-card transition-all hover:border-foreground/20 hover:shadow-elevated"
                >
                  <div
                    className={`relative aspect-[4/3] bg-gradient-to-br ${s.swatch}`}
                  >
                    <div className="absolute inset-0 bg-noise opacity-30 mix-blend-overlay" />
                    <div className="absolute left-5 top-5 rounded-full bg-black/30 px-2.5 py-1 text-[11px] font-mono font-semibold text-white backdrop-blur">
                      {s.n}
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-[18px] font-semibold tracking-tight">
                      {s.title}
                    </h3>
                    <p className="mt-2 text-[13.5px] leading-relaxed text-muted-foreground">
                      {s.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────
            FIND YOUR PROTOCOL — dark grid section
           ───────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-hero py-24 text-hero-foreground sm:py-28">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(120,170,255,0.18)_0%,transparent_50%)]" />
          <div className="absolute inset-0 bg-grid-faint opacity-30" />

          <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
            <div className="text-center">
              <h2 className="text-[34px] font-semibold tracking-tight sm:text-[44px]">
                Find your protocol.
              </h2>
              <p className="mx-auto mt-3 max-w-md text-[14.5px] text-white/55">
                {allProducts.length} products across {CATEGORY_LIST.length}{" "}
                categories — each targeting a different part of how you
                feel, look, and train.
              </p>
            </div>

            <div className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {CATEGORY_LIST.map(([key, meta]) => {
                const Icon = meta.icon;
                const count = allProducts.filter(
                  (p) => p.category === key,
                ).length;
                return (
                  <Link
                    key={key}
                    href={`/products?category=${meta.slug}`}
                    className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition-all hover:border-white/30 hover:bg-white/[0.08]"
                  >
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${meta.accent} opacity-0 transition-opacity group-hover:opacity-100`}
                    />
                    <div className="relative">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white">
                        <Icon className="h-4 w-4" />
                      </div>
                      <p className="mt-4 text-[14px] font-semibold text-white">
                        {meta.label}
                      </p>
                      <p className="mt-1 text-[12px] text-white/45">
                        {count} protocol{count !== 1 && "s"}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>

            <div className="mt-12 flex justify-center">
              <Link href="/products">
                <Button className="h-11 rounded-full bg-white px-6 text-[14px] font-semibold text-foreground hover:bg-white/90">
                  Explore all protocols
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────
            SEE EVERYTHING WE OFFER — derive's two-column list
           ───────────────────────────────────────────────────────── */}
        <section className="bg-background py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="grid gap-12 lg:grid-cols-[1fr_2fr]">
              {/* Left: title + category swatches */}
              <div>
                <h2 className="text-[36px] font-semibold leading-[1.05] tracking-tight">
                  See everything <br />
                  we offer
                </h2>
                <p className="mt-4 max-w-md text-[14px] leading-relaxed text-muted-foreground">
                  {allProducts.length} products across {CATEGORY_LIST.length}{" "}
                  categories. From your daily creatine to Rx peptides —
                  browse by category or scan the full list.
                </p>

                <div className="mt-8 grid grid-cols-2 gap-2.5">
                  {CATEGORY_LIST.map(([key, meta]) => {
                    const Icon = meta.icon;
                    return (
                      <Link
                        key={key}
                        href={`/products?category=${meta.slug}`}
                        className="group flex items-center gap-3 rounded-xl border border-border/60 bg-card p-3 transition-all hover:border-foreground/20"
                      >
                        <div
                          className={`flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br ${meta.accent}`}
                        >
                          <Icon className="h-[15px] w-[15px] text-foreground/70" />
                        </div>
                        <span className="text-[12.5px] font-medium leading-tight text-foreground">
                          {meta.label}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Right: 2-column protocol list */}
              <div className="grid gap-x-10 gap-y-1 sm:grid-cols-2">
                {byCategory
                  .flatMap((g) => g.products)
                  .slice(0, 14)
                  .map((p) => (
                    <Link
                      key={p.id}
                      href={`/products/${p.id}`}
                      className="group flex items-start gap-3 border-b border-border/50 py-4 transition-colors hover:bg-muted/40"
                    >
                      <span className="mt-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline gap-2">
                          <p className="truncate text-[14px] font-semibold text-foreground">
                            {p.name.split(" (")[0]}
                          </p>
                          <span className="font-mono text-[10.5px] uppercase tracking-wider text-muted-foreground">
                            {peptideTag(p.category)}
                          </span>
                        </div>
                        <p className="mt-0.5 line-clamp-1 text-[12.5px] text-muted-foreground">
                          {p.tag_line || p.description}
                        </p>
                      </div>
                    </Link>
                  ))}
              </div>
            </div>

            <div className="mt-12 flex justify-start lg:justify-center">
              <Link
                href="/products"
                className="inline-flex items-center gap-1 text-[13.5px] font-medium text-primary hover:text-primary/80"
              >
                Explore all {allProducts.length} protocols
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────
            FEATURED PRODUCTS GRID
           ───────────────────────────────────────────────────────── */}
        <section className="bg-surface py-24">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                Most loved
              </p>
              <h2 className="mt-3 text-[34px] font-semibold tracking-tight sm:text-[40px]">
                Member favorites
              </h2>
              <p className="mt-3 text-[14.5px] text-muted-foreground">
                The protocols our members keep coming back to.
              </p>
            </div>

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────
            COMPARISON TABLE — "Not all peptides are created equal"
           ───────────────────────────────────────────────────────── */}
        <section className="bg-background py-24 sm:py-28">
          <div className="mx-auto max-w-5xl px-5 sm:px-8">
            <div className="text-center">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Why medicine
              </p>
              <h2 className="mt-3 text-balance text-[34px] font-semibold tracking-tight sm:text-[44px]">
                Not all wellness is created equal.
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-[14.5px] text-muted-foreground">
                The difference between pharmaceutical-grade,
                clinician-reviewed protocols and the rest of the supplement
                aisle.
              </p>
            </div>

            <div className="mt-12 overflow-hidden rounded-2xl border border-border/70">
              <table className="w-full text-left text-[13.5px]">
                <thead>
                  <tr className="bg-surface">
                    <th className="w-[30%] px-5 py-4 text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground">
                      &nbsp;
                    </th>
                    <th className="px-5 py-4 text-[10.5px] font-semibold uppercase tracking-wider text-primary">
                      medicine
                    </th>
                    <th className="px-5 py-4 text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Research suppliers
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON_ROWS.map((row, i) => (
                    <tr
                      key={row.label}
                      className={i % 2 === 0 ? "bg-background" : "bg-surface/40"}
                    >
                      <td className="px-5 py-5 align-top text-[13px] font-medium text-foreground">
                        {row.label}
                      </td>
                      <td className="px-5 py-5 align-top text-[13px] text-foreground">
                        <div className="flex gap-2">
                          <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                          <span>{row.us}</span>
                        </div>
                      </td>
                      <td className="px-5 py-5 align-top text-[13px] text-muted-foreground">
                        <div className="flex gap-2">
                          <X className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-400" />
                          <span>{row.them}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-10 flex justify-center">
              <Link
                href="/products"
                className="inline-flex items-center gap-1 text-[13.5px] font-medium text-primary hover:text-primary/80"
              >
                See full comparison <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────
            TRUST MARQUEE
           ───────────────────────────────────────────────────────── */}
        <section className="overflow-hidden border-y border-border/60 bg-surface py-6">
          <div className="animate-marquee flex w-max items-center gap-12 px-6">
            {[...TRUST_ITEMS, ...TRUST_ITEMS, ...TRUST_ITEMS].map((item, i) => (
              <div key={i} className="flex shrink-0 items-center gap-2">
                <item.icon className="h-3.5 w-3.5 text-primary" />
                <span className="whitespace-nowrap text-[11.5px] font-semibold uppercase tracking-[0.14em] text-foreground/70">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────
            CLOSING CTA — black, derive-style
           ───────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-foreground py-28 text-background sm:py-36">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(120,170,255,0.18)_0%,transparent_50%)]" />
          <div className="absolute inset-0 bg-grid-faint opacity-20" />

          <div className="relative mx-auto max-w-4xl px-5 text-center sm:px-8">
            <h2 className="text-balance text-[44px] font-semibold leading-[1.05] tracking-tight sm:text-[64px]">
              Your body knows <br /> what it needs.
            </h2>
            <p className="mx-auto mt-6 max-w-md text-[15px] leading-relaxed text-background/60">
              {allProducts.length} products. One dashboard. Care team
              reviewed and shipped monthly — from $69/mo.
            </p>

            <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link href="/intake">
                <Button
                  size="lg"
                  className="h-12 rounded-full bg-primary px-7 text-[15px] font-semibold text-primary-foreground hover:bg-primary/90"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Build my protocol
                </Button>
              </Link>
              <Link href="/products">
                <Button
                  variant="outline"
                  size="lg"
                  className="h-12 rounded-full border-white/20 bg-transparent px-7 text-[15px] font-medium text-background hover:bg-white/10 hover:text-background"
                >
                  Browse the catalog
                </Button>
              </Link>
            </div>

            <p className="mt-8 text-[12px] text-background/40">
              HSA/FSA eligible · Ships free · Cancel anytime
            </p>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────
            FOOTER
           ───────────────────────────────────────────────────────── */}
        <footer className="border-t border-border/60 bg-background py-14">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="grid gap-10 sm:grid-cols-4">
              <div>
                <Link href="/" className="flex items-center gap-1.5">
                  <span className="text-[15px] font-semibold tracking-tight text-foreground">
                    medicine
                  </span>
                </Link>
                <p className="mt-4 max-w-[24ch] text-[12.5px] leading-relaxed text-muted-foreground">
                  The one-stop shop for wellness — vitamins, performance,
                  peptides, and Rx, delivered monthly.
                </p>
              </div>
              {[
                {
                  title: "Protocols",
                  links: CATEGORY_LIST.slice(0, 5).map(([, m]) => [
                    m.label,
                    `/products?category=${m.slug}`,
                  ]),
                },
                {
                  title: "Company",
                  links: [
                    ["How It Works", "/#how-it-works"],
                    ["Care Team", "/#how-it-works"],
                    ["Reviews", "/#how-it-works"],
                    ["Gift", "/intake"],
                  ],
                },
                {
                  title: "Support",
                  links: [
                    ["Login", "/login"],
                    ["Get Started", "/intake"],
                    ["Contact", "mailto:hello@medicine.com"],
                    ["Terms", "/#"],
                  ],
                },
              ].map((col) => (
                <div key={col.title}>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground">
                    {col.title}
                  </p>
                  <ul className="mt-4 space-y-2.5">
                    {col.links.map(([label, href]) => (
                      <li key={label}>
                        <Link
                          href={href}
                          className="text-[13px] text-muted-foreground hover:text-foreground"
                        >
                          {label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-border/60 pt-6 text-[11.5px] text-muted-foreground sm:flex-row sm:items-center">
              <p>© medicine 2026 — All rights reserved.</p>
              <p className="opacity-70">
                Compounded medications are not FDA-approved for safety,
                efficacy, or manufacturing. Care provided by independent
                physicians and pharmacies. CS 323 prototype.
              </p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

const COMPARISON_ROWS: { label: string; us: string; them: string }[] = [
  {
    label: "Sourcing",
    us: "Single-source pharma-grade APIs and clinically-dosed botanicals",
    them: "Anonymous suppliers, generic raw materials, opaque sourcing",
  },
  {
    label: "Purity testing",
    us: "Every batch third-party tested for purity, sterility, and contaminants",
    them: "Self-reported COAs, occasional spot checks at best",
  },
  {
    label: "Medical oversight",
    us: "Care team reviews every Rx order, monitors progress, adjusts dosing",
    them: "None — you're on your own",
  },
  {
    label: "Personalization",
    us: "AI intake builds your protocol; clinicians sign off before it ships",
    them: "Same blister-pack stack for everyone",
  },
  {
    label: "Dosing guidance",
    us: "Protocol-specific dosing guide and dashboard with every shipment",
    them: "Read the back of the bottle, hope for the best",
  },
  {
    label: "Pricing",
    us: "From $69/mo all-in — care team, dashboard, and shipping included",
    them: "Hidden subscriptions, paywalled support, no guarantee",
  },
];

function pickFeatured(products: Product[], n: number): Product[] {
  const seen = new Set<string>();
  const out: Product[] = [];
  // Round-robin one per category for visual variety
  for (const [key] of CATEGORY_LIST) {
    const next = products.find((p) => p.category === key && !seen.has(p.id));
    if (next) {
      out.push(next);
      seen.add(next.id);
      if (out.length >= n) break;
    }
  }
  // Fill remaining slots from any category
  for (const p of products) {
    if (out.length >= n) break;
    if (!seen.has(p.id)) {
      out.push(p);
      seen.add(p.id);
    }
  }
  return out.slice(0, n);
}

function peptideTag(category: string) {
  const map: Record<string, string> = {
    Foundational: "FND",
    "Athletic Performance": "PERF",
    Cognitive: "NTRO",
    "Sleep & Recovery": "RPR",
    Longevity: "LNG",
    Hormones: "HRM",
    "Weight Management": "GLP-1",
    "Stress & Mood": "GHK-Cu",
  };
  return map[category] ?? "RX";
}
