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
      className="product-card group flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-orange-200 hover:shadow-xl"
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
        <div className="product-image relative aspect-square w-full overflow-hidden bg-zinc-50/70">
          <div className="absolute inset-3 rounded-xl bg-white" />

          <SafeProductImage
            src={primaryImage}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className={`relative z-[1] object-contain p-5 transition duration-300 ${
              secondaryImage && secondaryReady
                ? "group-hover:scale-[1.035] group-hover:opacity-0"
                : "group-hover:scale-[1.035]"
            }`}
          />

          {secondaryImage && showSecondary ? (
            <div
              className={`absolute inset-0 z-[1] transition-opacity duration-300 ${
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
                className="object-contain p-5"
                loading="eager"
                onLoad={() => setSecondaryReady(true)}
              />
            </div>
          ) : null}

          <div className="absolute left-3 top-3 z-10 flex flex-col items-start gap-1.5">
            {hasDiscount ? (
              <span className="rounded-lg bg-orange-600 px-2.5 py-1 text-[0.65rem] font-extrabold uppercase tracking-wide text-white shadow-sm">
                {discountPercent}% Off
              </span>
            ) : null}

            {product.freeShipping ? (
              <span className="rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[0.62rem] font-bold uppercase tracking-wide text-emerald-700">
                Free Delivery
              </span>
            ) : null}
          </div>

          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/[0.035] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <Link href={`/products/${product.slug}`} className="block flex-1">
          <h3 className="line-clamp-2 min-h-[2.75rem] text-sm font-semibold leading-5 text-zinc-950 transition group-hover:text-orange-600 sm:text-[0.95rem]">
            {product.name}
          </h3>
        </Link>

        <div className="mt-3 border-t border-zinc-100 pt-3">
          <div className="flex flex-wrap items-end gap-x-2 gap-y-1">
            <span className="text-xl font-extrabold tracking-tight text-zinc-950">
              AED {product.price}
            </span>

            {hasDiscount ? (
              <span className="pb-0.5 text-xs font-medium text-zinc-400 line-through">
                AED {product.actualPrice}
              </span>
            ) : null}
          </div>

          <div className="mt-1 min-h-[1.25rem]">
            {hasDiscount ? (
              <p className="text-xs font-semibold text-emerald-700">
                You save AED {savings}
              </p>
            ) : null}
          </div>
        </div>

        <AddToCartButton
          product={product}
          label="Add to Cart"
          className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-hm-orange px-4 py-3 text-sm font-bold text-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-hm-orange-hover hover:shadow-md active:translate-y-0 active:scale-[0.99]"
        />
      </div>
    </article>
  );
}
