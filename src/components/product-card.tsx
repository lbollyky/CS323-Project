"use client";

import Link from "next/link";
import { Shield } from "lucide-react";
import type { Product } from "@/types/database";
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
  // Try to find a peptide-style abbreviation in the product name
  const known = name.match(
    /\b(BPC[- ]?157|TB[- ]?500|GLP[- ]?1|GHK[- ]?Cu|NMN|NAD\+?|CoQ10|HMB|MOTS[- ]?C|GHRP[- ]?6|CJC[- ]?1295|Ipamorelin|Tirzepatide|Semaglutide|Enclomiphene|DHEA|Apigenin|EGCG|EAA|BCAA|KSM[- ]?66)\b/i,
  );
  if (known) return known[0].toUpperCase().replace(/\s/g, "-");
  return PEPTIDE_CODES[category] ?? "RX";
}

export type ProductFormat = "vial" | "pill" | "powder";

export function productFormat(p: Product): ProductFormat {
  // Rx gets a vial unless it's a topical/oral pill
  if (p.type === "Rx") {
    if (/tretinoin|modafinil|rapamycin|enclomiphene/i.test(p.name)) return "pill";
    return "vial";
  }
  if (
    /protein|creatine|bcaa|eaa|pre[- ]?workout|electrolyte|powder|amino|collagen|carnitine|citrulline|glycine|beta[- ]?alanine|hydration/i.test(
      p.name,
    )
  ) {
    return "powder";
  }
  return "pill";
}

export function ProductCard({
  product,
  layout = "default",
}: {
  product: Product;
  layout?: "default" | "compact";
}) {
  const meta = CATEGORIES[product.category];
  const accent = meta?.accent ?? "from-blue-500/15 via-sky-400/10 to-cyan-500/5";
  const code = compoundCode(product.name, product.category);
  const fmt = productFormat(product);

  return (
    <Link
      href={`/products/${product.id}`}
      className="group flex flex-col overflow-hidden rounded-3xl border border-border/60 bg-card transition-all duration-500 hover:border-foreground/15 hover:shadow-elevated hover:-translate-y-1"
    >
      {/* ─── Product visual ─── */}
      <div className="relative aspect-[4/3.2] overflow-hidden bg-gradient-to-br from-stone-100 via-neutral-50 to-stone-200">
        <div className={`absolute inset-0 bg-gradient-to-tr ${accent}`} />
        <div className="absolute inset-0 bg-noise opacity-30 mix-blend-overlay" />
        <div className="absolute bottom-0 left-1/2 h-3 w-32 -translate-x-1/2 rounded-full bg-black/20 blur-md" />

        <div className="absolute inset-0 flex items-center justify-center">
          <ProductIllustration product={product} format={fmt} code={code} />
        </div>

        {product.type === "Rx" && (
          <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-foreground/85 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-background backdrop-blur">
            <Shield className="h-2.5 w-2.5" />
            Rx
          </span>
        )}

        <span className="absolute left-3 top-3 inline-flex items-center rounded-full bg-white/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-foreground/80 backdrop-blur">
          {meta?.label ?? product.category}
        </span>
      </div>

      {/* ─── Body ─── */}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-baseline gap-2">
          <h3 className="text-[17px] font-semibold tracking-tight text-foreground">
            {product.name.split(" (")[0]}
          </h3>
          <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground/80">
            {code}
          </span>
        </div>
        <p
          className={
            "mt-2 text-[13.5px] leading-relaxed text-muted-foreground " +
            (layout === "compact" ? "line-clamp-2" : "line-clamp-3")
          }
        >
          {product.tag_line || product.description}
        </p>

        <div className="mt-5 flex items-end justify-between">
          <div>
            <p className="text-[20px] font-semibold tabular-nums text-foreground">
              ${Math.round(product.price)}
              <span className="text-[12px] font-normal text-muted-foreground">
                /mo
              </span>
            </p>
          </div>
          <span className="text-[12px] font-medium text-primary opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            Learn more →
          </span>
        </div>
      </div>
    </Link>
  );
}

/* ────────────────────────────────────────────────────────────
   Three illustrations: vial (peptides/Rx), pill bottle
   (capsules), and powder tub (sports nutrition). All driven
   by an HSL hue derived from the product name so each
   product reads visually distinct on the catalog grid.
   ──────────────────────────────────────────────────────────── */

export function ProductIllustration({
  product,
  format,
  code,
  size = 115,
}: {
  product: Product;
  format: ProductFormat;
  code: string;
  size?: number;
}) {
  const hue =
    (product.name.charCodeAt(0) * 13 +
      product.name.charCodeAt(product.name.length - 1) * 7) %
    360;

  if (format === "powder") {
    return <PowderTub label={product.name} code={code} hue={hue} size={size} />;
  }
  if (format === "pill") {
    return <PillBottle label={product.name} code={code} hue={hue} size={size} />;
  }
  return <Vial label={product.name} code={code} hue={hue} size={size} />;
}

function Vial({
  label,
  code,
  hue,
  size,
}: {
  label: string;
  code: string;
  hue: number;
  size: number;
}) {
  const fill = `hsl(${hue}, 55%, 78%)`;
  const fillDeep = `hsl(${hue}, 60%, 64%)`;
  const id = `vial-${hue}-${label.replace(/\W/g, "")}`;

  return (
    <svg
      viewBox="0 0 120 160"
      width={size}
      height={size * 1.35}
      xmlns="http://www.w3.org/2000/svg"
      className="drop-shadow-xl transition-transform duration-700 group-hover:-translate-y-1 group-hover:rotate-[-2deg]"
      aria-hidden
    >
      <rect x="42" y="6" width="36" height="22" rx="3" fill="#1a1a1a" />
      <rect x="40" y="22" width="40" height="10" rx="2" fill="#0a0a0a" />
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="white" stopOpacity="0.95" />
          <stop offset="40%" stopColor={fill} stopOpacity="0.95" />
          <stop offset="100%" stopColor={fillDeep} stopOpacity="0.95" />
        </linearGradient>
      </defs>
      <rect
        x="28"
        y="32"
        width="64"
        height="118"
        rx="6"
        fill={`url(#${id})`}
        stroke="rgba(0,0,0,0.06)"
      />
      <rect x="34" y="38" width="6" height="100" rx="3" fill="white" opacity="0.45" />
      <rect x="32" y="58" width="56" height="68" rx="3" fill="white" opacity="0.92" />
      <g transform="translate(60, 72)" fill="#0a0a0a">
        <path d="M0 -6 L1.5 -1.5 L6 0 L1.5 1.5 L0 6 L-1.5 1.5 L-6 0 L-1.5 -1.5 Z" />
      </g>
      <text x="60" y="92" textAnchor="middle" fontSize="11" fontWeight="700" fill="#0a0a0a" fontFamily="ui-sans-serif, system-ui">
        {label.split(" ")[0].slice(0, 9)}
      </text>
      <text x="60" y="106" textAnchor="middle" fontSize="6.5" fontWeight="500" fill="#666" fontFamily="ui-sans-serif, system-ui" letterSpacing="1">
        {code}
      </text>
      <line x1="40" y1="114" x2="80" y2="114" stroke="#ddd" strokeWidth="0.5" />
      <text x="60" y="121" textAnchor="middle" fontSize="5" fill="#999" fontFamily="ui-sans-serif, system-ui" letterSpacing="0.8">
        PHARMA-GRADE
      </text>
    </svg>
  );
}

function PillBottle({
  label,
  code,
  hue,
  size,
}: {
  label: string;
  code: string;
  hue: number;
  size: number;
}) {
  const fill = `hsl(${hue}, 50%, 92%)`;
  const fillDeep = `hsl(${hue}, 45%, 80%)`;
  const id = `pill-${hue}-${label.replace(/\W/g, "")}`;

  return (
    <svg
      viewBox="0 0 130 160"
      width={size * 1.05}
      height={size * 1.35}
      xmlns="http://www.w3.org/2000/svg"
      className="drop-shadow-xl transition-transform duration-700 group-hover:-translate-y-1 group-hover:rotate-[-1deg]"
      aria-hidden
    >
      {/* Cap */}
      <rect x="32" y="8" width="66" height="20" rx="3" fill="#0f1117" />
      <rect x="30" y="22" width="70" height="12" rx="2" fill="#0a0c12" />

      {/* Body — soft amber/ivory bottle */}
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="white" stopOpacity="1" />
          <stop offset="50%" stopColor={fill} stopOpacity="1" />
          <stop offset="100%" stopColor={fillDeep} stopOpacity="1" />
        </linearGradient>
      </defs>
      <path
        d="M22 36 Q22 30 28 30 H102 Q108 30 108 36 V146 Q108 152 102 152 H28 Q22 152 22 146 Z"
        fill={`url(#${id})`}
        stroke="rgba(0,0,0,0.05)"
      />

      {/* Glass highlight */}
      <rect x="28" y="38" width="6" height="100" rx="3" fill="white" opacity="0.55" />

      {/* Label */}
      <rect x="26" y="58" width="78" height="80" rx="3" fill="white" opacity="0.94" />

      <g transform="translate(65, 74)" fill="#0a0a0a">
        <path d="M0 -7 L1.7 -1.7 L7 0 L1.7 1.7 L0 7 L-1.7 1.7 L-7 0 L-1.7 -1.7 Z" />
      </g>

      <text x="65" y="96" textAnchor="middle" fontSize="11.5" fontWeight="700" fill="#0a0a0a" fontFamily="ui-sans-serif, system-ui">
        {label.split(" ")[0].slice(0, 11)}
      </text>
      <text x="65" y="110" textAnchor="middle" fontSize="6.5" fontWeight="500" fill="#666" fontFamily="ui-sans-serif, system-ui" letterSpacing="1">
        {code}
      </text>
      <line x1="38" y1="118" x2="92" y2="118" stroke="#ddd" strokeWidth="0.5" />
      <text x="65" y="125" textAnchor="middle" fontSize="5" fill="#999" fontFamily="ui-sans-serif, system-ui" letterSpacing="0.8">
        60 CAPSULES
      </text>
      <text x="65" y="132" textAnchor="middle" fontSize="4.5" fill="#aaa" fontFamily="ui-sans-serif, system-ui" letterSpacing="0.6">
        DIETARY SUPPLEMENT
      </text>
    </svg>
  );
}

function PowderTub({
  label,
  code,
  hue,
  size,
}: {
  label: string;
  code: string;
  hue: number;
  size: number;
}) {
  const fill = `hsl(${hue}, 60%, 78%)`;
  const fillDeep = `hsl(${hue}, 55%, 60%)`;
  const id = `tub-${hue}-${label.replace(/\W/g, "")}`;

  return (
    <svg
      viewBox="0 0 150 150"
      width={size * 1.25}
      height={size * 1.25}
      xmlns="http://www.w3.org/2000/svg"
      className="drop-shadow-xl transition-transform duration-700 group-hover:-translate-y-1 group-hover:rotate-[-1deg]"
      aria-hidden
    >
      {/* Lid */}
      <rect x="14" y="14" width="122" height="22" rx="4" fill="#0f1117" />
      <rect x="12" y="30" width="126" height="6" rx="2" fill="#0a0c12" />

      {/* Body */}
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={fill} stopOpacity="1" />
          <stop offset="100%" stopColor={fillDeep} stopOpacity="1" />
        </linearGradient>
      </defs>
      <rect
        x="14"
        y="36"
        width="122"
        height="100"
        rx="6"
        fill={`url(#${id})`}
        stroke="rgba(0,0,0,0.05)"
      />

      {/* Side highlight */}
      <rect x="20" y="42" width="6" height="86" rx="3" fill="white" opacity="0.4" />

      {/* Front label panel */}
      <rect x="22" y="50" width="106" height="78" rx="3" fill="white" opacity="0.95" />

      <g transform="translate(75, 64)" fill="#0a0a0a">
        <path d="M0 -7 L1.7 -1.7 L7 0 L1.7 1.7 L0 7 L-1.7 1.7 L-7 0 L-1.7 -1.7 Z" />
      </g>

      <text x="75" y="86" textAnchor="middle" fontSize="13" fontWeight="800" fill="#0a0a0a" fontFamily="ui-sans-serif, system-ui" letterSpacing="-0.3">
        {label.split(" ")[0].toUpperCase().slice(0, 12)}
      </text>
      <text x="75" y="100" textAnchor="middle" fontSize="7" fontWeight="600" fill="#555" fontFamily="ui-sans-serif, system-ui" letterSpacing="1.2">
        {code}
      </text>
      <line x1="40" y1="108" x2="110" y2="108" stroke="#ddd" strokeWidth="0.5" />
      <text x="75" y="116" textAnchor="middle" fontSize="5.5" fill="#888" fontFamily="ui-sans-serif, system-ui" letterSpacing="1">
        30 SERVINGS · NET WT 600 G
      </text>
      <text x="75" y="124" textAnchor="middle" fontSize="4.5" fill="#aaa" fontFamily="ui-sans-serif, system-ui" letterSpacing="0.6">
        THIRD-PARTY TESTED
      </text>
    </svg>
  );
}
