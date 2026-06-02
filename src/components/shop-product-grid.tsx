"use client";

import { useState } from "react";
import Image from "next/image";
import type { ProtocolProduct } from "@/lib/products";
import { ShopAddToCartButton } from "@/components/shop-add-to-cart-button";
import { ProductDetailModal } from "@/components/product-detail-modal";

export function ShopProductGrid({ products }: { products: ProtocolProduct[] }) {
  const [active, setActive] = useState<ProtocolProduct | null>(null);

  return (
    <>
      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {products.map((p) => (
          <article
            key={p.id}
            className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-background transition-colors hover:border-foreground/25"
          >
            <button
              type="button"
              onClick={() => setActive(p)}
              aria-label={`View details for ${p.name}`}
              className="focus-ring flex flex-1 flex-col text-left"
            >
              {p.image_url && (
                <div className="relative aspect-[4/5] w-full overflow-hidden">
                  <Image
                    src={p.image_url}
                    alt={`${p.name} bottle`}
                    fill
                    sizes="(min-width: 640px) 33vw, 100vw"
                    className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                  />
                </div>
              )}
              <div className="flex flex-1 flex-col p-5">
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

                <span className="mt-4 inline-flex items-center gap-1 text-[12.5px] font-medium text-foreground underline-offset-4 group-hover:underline">
                  View details
                </span>
              </div>
            </button>

            <div className="flex flex-col gap-1.5 px-5 pb-5">
              <ShopAddToCartButton product={p} />
            </div>
          </article>
        ))}
      </div>

      <ProductDetailModal product={active} onClose={() => setActive(null)} />
    </>
  );
}
