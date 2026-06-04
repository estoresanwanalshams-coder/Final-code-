"use client";

import { memo, useCallback, useState } from "react";
import { addProductToCartWithQuantity } from "@/lib/cart";
import type { Product } from "@/lib/products";

type AddToCartButtonProps = {
  product: Product;
  quantity?: number;
  className?: string;
  label?: string;
};

export const AddToCartButton = memo(function AddToCartButton({
  product,
  quantity = 1,
  className,
  label = "Add to Cart",
}: AddToCartButtonProps) {
  const [added, setAdded] = useState(false);

  const handleAddToCart = useCallback(() => {
    addProductToCartWithQuantity(product, quantity);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1400);
  }, [product, quantity]);

  return (
    <button
      type="button"
      onClick={handleAddToCart}
      className={className}
      aria-live="polite"
    >
      {added ? "Added" : label}
    </button>
  );
});
