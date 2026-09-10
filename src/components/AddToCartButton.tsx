"use client";

import { memo, useCallback, useEffect, useRef, useState } from "react";
import {
  addProductToCartWithQuantity,
  isProductAvailableForPurchase,
} from "@/lib/cart";
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
  className = "",
  label = "Add to Cart",
}: AddToCartButtonProps) {
  const [added, setAdded] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isAvailable = isProductAvailableForPurchase(product);

  const handleAddToCart = useCallback(() => {
    if (!isAvailable) {
      return;
    }
    addProductToCartWithQuantity(product, quantity);

    setAdded(true);

    if (resetTimer.current) {
      clearTimeout(resetTimer.current);
    }

    resetTimer.current = setTimeout(() => {
      setAdded(false);
      resetTimer.current = null;
    }, 1400);
  }, [isAvailable, product, quantity]);

  useEffect(() => {
    return () => {
      if (resetTimer.current) {
        clearTimeout(resetTimer.current);
      }
    };
  }, []);

  return (
    <button
      type="button"
      onClick={handleAddToCart}
      disabled={!isAvailable}
      className={`${className} ${
        !isAvailable
          ? "!cursor-not-allowed !border-zinc-200 !bg-zinc-100 !text-zinc-500 !shadow-none hover:!translate-y-0 hover:!bg-zinc-100"
          : added
            ? "!bg-emerald-600 hover:!bg-emerald-600"
            : ""
      }`}
      aria-live="polite"
    >
      <span
        className={`inline-flex items-center justify-center gap-2 transition-all duration-200 ${
          added ? "scale-105" : "scale-100"
        }`}
      >
        {!isAvailable ? (
          <span>Out of Stock</span>
        ) : added ? (
          <>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path d="m5 12 4 4L19 6" />
            </svg>

            <span>Added to Cart</span>
          </>
        ) : (
          <span>{label}</span>
        )}
      </span>
    </button>
  );
});
