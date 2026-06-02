"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Play, X } from "lucide-react";
import type { ProtocolProduct } from "@/lib/products";
import { ShopAddToCartButton } from "@/components/shop-add-to-cart-button";
import { cn } from "@/lib/utils";

const PANEL_BG =
  "bg-[linear-gradient(165deg,#f6f6f7_0%,#efeff0_52%,#e7e7ea_100%)]";

const isVideo = (src: string) => /\.(mp4|webm|mov)$/i.test(src);

export function ProductDetailModal({
  product,
  onClose,
}: {
  product: ProtocolProduct | null;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const open = product !== null;
  const [imgIndex, setImgIndex] = useState(0);

  // Reset the gallery to the first image whenever a new product opens.
  useEffect(() => {
    setImgIndex(0);
  }, [product?.id]);

  useEffect(() => {
    if (!open) return;

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    closeRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!product) return null;

  const images =
    product.gallery && product.gallery.length > 0
      ? product.gallery
      : product.image_url
        ? [product.image_url]
        : [];
  const heroSrc = images[Math.min(imgIndex, images.length - 1)];

  const facts: Array<{ label: string; value: string }> = [
    { label: "Form", value: "Oral capsule" },
    { label: "Supply", value: `${product.day_supply}-day` },
    { label: "Category", value: product.category },
    {
      label: "Access",
      value: product.type === "OTC" ? "No prescription" : "Prescription",
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-modal-title"
    >
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="animate-modal-overlay absolute inset-0 h-full w-full cursor-default bg-foreground/40 backdrop-blur-sm"
      />

      <div className="animate-modal-panel relative z-10 flex max-h-[92dvh] w-full max-w-4xl flex-col overflow-hidden rounded-t-2xl border border-border bg-background shadow-2xl sm:flex-row sm:rounded-2xl">
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="focus-ring absolute right-3 top-3 z-20 inline-flex h-9 w-9 items-center justify-center rounded-full bg-background/80 text-muted-foreground backdrop-blur transition-colors hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>

        {heroSrc && (
          <div className="shrink-0 border-b border-border sm:w-[44%] sm:self-start sm:border-b-0 sm:border-r">
            <div className={`relative aspect-[4/5] w-full ${PANEL_BG}`}>
              {isVideo(heroSrc) ? (
                <video
                  key={heroSrc}
                  src={heroSrc}
                  className="animate-modal-overlay absolute inset-0 h-full w-full object-cover object-center"
                  controls
                  autoPlay
                  muted
                  loop
                  playsInline
                />
              ) : (
                <Image
                  key={heroSrc}
                  src={heroSrc}
                  alt={`${product.name}`}
                  fill
                  sizes="(min-width: 640px) 440px, 100vw"
                  quality={100}
                  className="animate-modal-overlay object-cover object-center"
                />
              )}
            </div>

            {images.length > 1 && (
              <div className="flex gap-2 px-3 pb-4 pt-3">
                {images.map((src, i) => (
                    <button
                      key={src}
                      type="button"
                      onClick={() => setImgIndex(i)}
                      aria-label={`View image ${i + 1}`}
                      aria-current={i === imgIndex}
                      className={cn(
                        "focus-ring relative aspect-square h-16 w-16 shrink-0 overflow-hidden rounded-lg border transition-colors",
                        i === imgIndex
                          ? "border-foreground"
                          : "border-border/60 hover:border-foreground/40",
                      )}
                    >
                      {isVideo(src) ? (
                        <>
                          <video
                            src={src}
                            muted
                            playsInline
                            preload="metadata"
                            className="absolute inset-0 h-full w-full object-cover object-center"
                          />
                          <span className="absolute inset-0 flex items-center justify-center bg-foreground/15">
                            <Play className="h-4 w-4 fill-background text-background" />
                          </span>
                        </>
                      ) : (
                        <Image
                          src={src}
                          alt=""
                          fill
                          sizes="64px"
                          className="object-cover object-center"
                        />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

        <div className="flex min-h-0 flex-1 flex-col">
          <div className="overflow-y-auto overscroll-contain">
          <div className="p-6 sm:p-8">
            <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground">
              {product.category}
            </p>
            <div className="mt-2 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 pr-9">
              <h2
                id="product-modal-title"
                className="text-[26px] font-medium tracking-tight"
              >
                {product.name}
              </h2>
              <span className="text-[22px] font-medium tabular-nums">
                ${product.price}
              </span>
            </div>
            <p className="mt-1.5 text-[14px] leading-relaxed text-foreground/80">
              {product.tag_line}
            </p>
            <p className="mt-1 text-[12px] text-muted-foreground">
              {product.active}
            </p>

            <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {facts.map((f) => (
                <div
                  key={f.label}
                  className="rounded-xl border border-border bg-surface/40 px-3 py-2.5"
                >
                  <p className="text-[10.5px] uppercase tracking-wider text-muted-foreground">
                    {f.label}
                  </p>
                  <p className="mt-0.5 text-[13px] font-medium">{f.value}</p>
                </div>
              ))}
            </div>

            <Section title="What it is">
              <p>{product.description}</p>
            </Section>

            <Section title="How it works">
              <p>{product.science ?? product.mechanism}</p>
            </Section>

            <Section title="Best for">
              <ul className="space-y-1.5">
                {product.best_for.map((b) => (
                  <li key={b} className="flex gap-2">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-foreground/40" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </Section>

            {product.how_to_take && (
              <Section title="How to take">
                <p>{product.how_to_take}</p>
              </Section>
            )}

            {product.faqs && product.faqs.length > 0 && (
              <Section title="Common questions">
                <div className="space-y-3">
                  {product.faqs.map((f) => (
                    <div key={f.q}>
                      <p className="text-[13px] font-medium text-foreground">
                        {f.q}
                      </p>
                      <p className="mt-0.5">{f.a}</p>
                    </div>
                  ))}
                </div>
              </Section>
            )}
          </div>
          </div>

          <div className="flex items-center gap-3 border-t border-border bg-background/95 px-6 py-4 backdrop-blur">
            <ShopAddToCartButton product={product} primary />
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-6 border-t border-border/60 pt-5">
      <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground">
        {title}
      </p>
      <div className="mt-2 text-[13.5px] leading-relaxed text-muted-foreground">
        {children}
      </div>
    </div>
  );
}
