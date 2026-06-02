"use client";

import { useState } from "react";
import type { ProtocolProduct } from "@/lib/products";
import { ProductDetailModal } from "@/components/product-detail-modal";

export function ProductModalTrigger({
  product,
  className,
  ariaLabel,
  children,
}: {
  product: ProtocolProduct;
  className?: string;
  ariaLabel?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={ariaLabel ?? `View details for ${product.name}`}
        className={className}
      >
        {children}
      </button>
      <ProductDetailModal
        product={open ? product : null}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
