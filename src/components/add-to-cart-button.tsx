"use client";

import { Plus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/stores/cart-store";
import type { Product } from "@/types/database";

export function AddToCartButton({ product }: { product: Product }) {
  const items = useCartStore((s) => s.items);
  const addItem = useCartStore((s) => s.addItem);
  const inCart = items.some((i) => i.product.id === product.id);

  return (
    <Button
      size="lg"
      variant={inCart ? "secondary" : "default"}
      onClick={() => !inCart && addItem(product)}
      disabled={inCart}
      className="h-12 rounded-full px-6 text-[14px] font-semibold"
    >
      {inCart ? (
        <>
          <Check className="mr-1.5 h-4 w-4" />
          Added
        </>
      ) : (
        <>
          <Plus className="mr-1.5 h-4 w-4" />
          Add to subscription
        </>
      )}
    </Button>
  );
}
