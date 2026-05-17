"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Plus } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import type { ProtocolProduct } from "@/lib/products";
import { cn } from "@/lib/utils";

export function ShopAddToCartButton({
  product,
  primary = false,
}: {
  product: ProtocolProduct;
  primary?: boolean;
}) {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const [added, setAdded] = useState(false);

  function add() {
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  }

  function buyNow() {
    addItem(product);
    router.push("/checkout");
  }

  if (primary) {
    return (
      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={buyNow}
          className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-foreground px-5 text-[13.5px] font-medium text-background transition-opacity hover:opacity-90"
        >
          Buy now — ${product.price}
        </button>
        <button
          type="button"
          onClick={add}
          className={cn(
            "inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border px-4 text-[13.5px] transition-colors",
            added
              ? "border-emerald-500/40 text-emerald-600"
              : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground",
          )}
        >
          {added ? (
            <>
              <Check className="h-3.5 w-3.5" /> Added
            </>
          ) : (
            <>
              <Plus className="h-3.5 w-3.5" /> Add to cart
            </>
          )}
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={buyNow}
        className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-foreground text-[13px] font-medium text-background transition-opacity hover:opacity-90"
      >
        Buy now
      </button>
      <button
        type="button"
        onClick={add}
        className={cn(
          "inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border text-[13px] transition-colors",
          added
            ? "border-emerald-500/40 text-emerald-600"
            : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground",
        )}
      >
        {added ? (
          <>
            <Check className="h-3.5 w-3.5" /> Added
          </>
        ) : (
          <>
            <Plus className="h-3.5 w-3.5" /> Add to cart
          </>
        )}
      </button>
    </>
  );
}
