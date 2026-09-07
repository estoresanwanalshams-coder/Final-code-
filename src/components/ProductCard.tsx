"use client";

import Link from "next/link";
import { useState } from "react";
import { AddToCartButton } from "@/components/AddToCartButton";
import { SafeProductImage } from "@/components/SafeProductImage";
import type { Product } from "@/lib/products";

type ProductCardProps = {
  product: Product;
  index: number;
};

export function ProductCard({ product, index }: ProductCardProps) {
  const images = Array.from(
    new Set([product.imageUrl, ...(product.imageUrls ?? [])].filter(Boolean)),
  );

  const primaryImage = images[0] ?? product.imageUrl ?? "";

  const secondaryImage = images[1];

  const [secondaryReady, setSecondaryReady] = useState(false);

  const [prefetchSecondary, setPrefetchSecondary] = useState(false);

  const showSecondary =
    Boolean(secondaryImage) && (prefetchSecondary || secondaryReady);

  const hasDiscount =
    typeof product.actualPrice === "number" &&
    product.actualPrice > product.price;

  const savings = hasDiscount ? product.actualPrice! - product.price : 0;

  const discountPercent = hasDiscount
    ? Math.round((savings / product.actualPrice!) * 100)
    : 0;

  return (
    <article
      className="product-card group flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white"
      style={{
        animationDelay: `${index * 70}ms`,
      }}
      onMouseEnter={() => {
        if (secondaryImage) {
          setPrefetchSecondary(true);
        }
      }}
      onFocusCapture={() => {
        if (secondaryImage) {
          setPrefetchSecondary(true);
        }
      }}
    >
      <Link
        href={`/products/${product.slug}`}
        className="product-card-media block shrink-0"
      >
        <div className="product-image relative aspect-square w-full overflow-hidden bg-white p-3">
          <SafeProductImage
            src={primaryImage}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className={`object-contain p-3 transition duration-300 ${
              secondaryImage && secondaryReady
                ? "group-hover:scale-[1.03] group-hover:opacity-0"
                : "group-hover:scale-[1.03]"
            }`}
          />

          {secondaryImage && showSecondary ? (
            <div
              className={`absolute inset-0 bg-white transition-opacity duration-300 ${
                secondaryReady
                  ? "opacity-0 group-hover:opacity-100"
                  : "opacity-0"
              }`}
            >
              <SafeProductImage
                src={secondaryImage}
                alt={`${product.name} alternate view`}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-contain p-3"
                loading="eager"
                onLoad={() => setSecondaryReady(true)}
              />
            </div>
          ) : null}

          <div className="absolute left-2 top-2 z-10 flex flex-col items-start gap-1.5">
            {hasDiscount ? (
              <span className="rounded-full bg-orange-600 px-2.5 py-1 text-[0.65rem] font-extrabold uppercase tracking-wide text-white shadow-sm">
                {discountPercent}% OFF
              </span>
            ) : null}

            {product.freeShipping ? (
              <span className="rounded-full bg-emerald-600 px-2.5 py-1 text-[0.62rem] font-bold uppercase tracking-wide text-white shadow-sm">
                Free Delivery
              </span>
            ) : null}
          </div>

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/[0.04] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <Link href={`/products/${product.slug}`} className="block flex-1">
          <h3 className="line-clamp-2 min-h-[3rem] text-sm font-semibold leading-6 text-zinc-950 transition group-hover:text-orange-600 sm:text-[0.95rem]">
            {product.name}
          </h3>
        </Link>

        <div className="mt-3">
          <div className="flex flex-wrap items-end gap-x-2 gap-y-1">
            <span className="text-lg font-extrabold text-zinc-950">
              AED {product.price}
            </span>

            {hasDiscount ? (
              <span className="pb-0.5 text-xs text-zinc-400 line-through">
                AED {product.actualPrice}
              </span>
            ) : null}
          </div>

          {hasDiscount ? (
            <p className="mt-1 text-xs font-semibold text-emerald-700">
              Save AED {savings}
            </p>
          ) : null}
        </div>

        <AddToCartButton
          product={product}
          label="Add to Cart"
          className="mt-4 inline-flex w-full items-center justify-center rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-orange-700 active:scale-[0.99]"
        />
      </div>
    </article>
  );
}
