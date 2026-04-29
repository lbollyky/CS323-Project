"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { cn } from "@/lib/utils";

export function CartButton({
  variant = "default",
}: {
  variant?: "default" | "transparent";
}) {
  const count = useCartStore((s) => s.items.length);
  const isTransparent = variant === "transparent";

  return (
    <Link
      href="/checkout"
      aria-label="Cart"
      className={cn(
        "relative inline-flex h-9 w-9 items-center justify-center rounded-full transition-colors",
        isTransparent
          ? "text-white/80 hover:text-white hover:bg-white/10"
          : "text-foreground/70 hover:text-foreground hover:bg-muted",
      )}
    >
      <ShoppingBag className="h-[18px] w-[18px]" />
      {count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
          {count}
        </span>
      )}
    </Link>
  );
}
