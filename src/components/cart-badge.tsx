"use client";

import Link from "next/link";
import { useCartStore } from "@/stores/cart-store";
import { useMounted } from "@/lib/use-mounted";

export function CartBadge() {
  const mounted = useMounted();
  const count = useCartStore((s) => s.count());

  if (!mounted || count === 0) return null;

  return (
    <Link
      href="/checkout"
      className="ml-1 inline-flex h-8 items-center gap-1.5 rounded-full bg-foreground px-3 text-[12.5px] font-medium text-background transition-opacity hover:opacity-90"
    >
      Cart
      <span className="tabular-nums opacity-70">{count}</span>
    </Link>
  );
}
