"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AddToCartButton } from "@/components/AddToCartButton";
import { upsertCartProductQuantity } from "@/lib/cart";
import type { Product } from "@/lib/products";

type ProductActionBarProps = {
  product: Product;
};

export function ProductActionBar({ product }: ProductActionBarProps) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);

  function handleBuyNow() {
    upsertCartProductQuantity(product, quantity);
    router.push(`/inquiry/${product.slug}?qty=${quantity}`);
  }

  return (
    <div className="mt-8 flex flex-col gap-3">
      <div className="inline-flex w-fit items-center border border-zinc-300 bg-white">
        <button
          type="button"
          onClick={() => setQuantity((current) => Math.max(1, current - 1))}
          className="h-10 w-10 border-r border-zinc-300 text-lg font-semibold"
          aria-label="Decrease quantity"
        >
          -
        </button>
        <span className="flex h-10 min-w-14 items-center justify-center text-sm font-semibold">
          {quantity}
        </span>
        <button
          type="button"
          onClick={() => setQuantity((current) => current + 1)}
          className="h-10 w-10 border-l border-zinc-300 text-lg font-semibold"
          aria-label="Increase quantity"
        >
          +
        </button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <AddToCartButton product={product} quantity={quantity} className="btn-soft justify-center" />
        <button
          type="button"
          onClick={handleBuyNow}
          className="btn-soft justify-center"
        >
          Buy Now
        </button>
      </div>
    </div>
  );
}
