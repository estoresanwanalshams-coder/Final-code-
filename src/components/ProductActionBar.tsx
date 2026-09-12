"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AddToCartButton } from "@/components/AddToCartButton";
import {
  isProductAvailableForPurchase,
  upsertCartProductQuantity,
} from "@/lib/cart";
import type { Product } from "@/lib/products";

type ProductActionBarProps = {
  product: Product;
};

const whatsappNumber = "971562300750";

export function ProductActionBar({ product }: ProductActionBarProps) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const isAvailable = isProductAvailableForPurchase(product);

  function handleBuyNow() {
    if (!isAvailable) {
      return;
    }

    upsertCartProductQuantity(product, quantity);
    router.push(`/inquiry/${product.slug}?qty=${quantity}`);
  }

  function handleWhatsAppOrder() {
    const productUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}/products/${product.slug}`
        : "";

    const message = [
      "Hello HM Shop Online,",
      "",
      "I would like to order this product:",
      product.name,
      `Price: AED ${product.price}`,
      `Quantity: ${quantity}`,
      productUrl,
      "",
      "Please confirm availability and delivery details.",
    ].join("\n");

    window.open(
      `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer",
    );
  }

  return (
    <div className="mt-6 border-t border-zinc-100 pt-6">
      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-zinc-500">
          Quantity
        </p>

        <div className="inline-flex items-center overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50 shadow-sm">
          <button
            disabled={!isAvailable}
            type="button"
            onClick={() => setQuantity((current) => Math.max(1, current - 1))}
            className="flex h-11 w-11 items-center justify-center border-r border-zinc-200 text-xl font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Decrease quantity"
          >
            −
          </button>

          <span className="flex h-11 min-w-14 items-center justify-center text-sm font-bold text-zinc-950">
            {quantity}
          </span>

          <button
            disabled={!isAvailable}
            type="button"
            onClick={() => setQuantity((current) => current + 1)}
            className="flex h-11 w-11 items-center justify-center border-l border-zinc-200 text-xl font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <AddToCartButton
          product={product}
          quantity={quantity}
          className="flex min-h-12 items-center justify-center rounded-xl border-2 border-hm-orange bg-white px-3 py-3 text-center text-sm font-bold text-hm-orange transition hover:bg-orange-50 active:scale-[0.98] sm:px-5"
        />

        <button
          type="button"
          onClick={handleBuyNow}
          disabled={!isAvailable}
          className={`flex min-h-12 items-center justify-center rounded-xl px-3 py-3 text-sm font-bold transition sm:px-5 ${
            isAvailable
              ? "bg-hm-orange text-white shadow-sm hover:bg-hm-orange-hover active:scale-[0.98]"
              : "cursor-not-allowed bg-zinc-100 text-zinc-500"
          }`}
        >
          {isAvailable ? "Buy Now" : "Out of Stock"}
        </button>
      </div>

      <button
        type="button"
        onClick={handleWhatsAppOrder}
        className="mt-3 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm font-bold text-emerald-700 transition hover:border-emerald-300 hover:bg-emerald-100 active:scale-[0.99]"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-5 w-5"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884" />
        </svg>
        Order on WhatsApp
      </button>
    </div>
  );
}
