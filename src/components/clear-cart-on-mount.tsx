"use client";

import { useEffect } from "react";
import { useCartStore } from "@/stores/cart-store";

export function ClearCartOnMount() {
  const clearCart = useCartStore((s) => s.clearCart);
  useEffect(() => {
    // Side effect on an external store, not local state.
    clearCart();
  }, [clearCart]);
  return null;
}
