"use client";

import { useEffect } from "react";
import { trackViewItem } from "@/lib/analytics";
import type { Product } from "@/lib/products";

type ProductViewTrackerProps = {
  product: Product;
};

export function ProductViewTracker({ product }: ProductViewTrackerProps) {
  useEffect(() => {
    trackViewItem(product);
  }, [product]);

  return null;
}