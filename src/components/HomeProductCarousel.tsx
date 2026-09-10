"use client";

import Link from "next/link";
import { useRef } from "react";
import { ProductCard } from "@/components/ProductCard";
import type { Product } from "@/lib/products";

type HomeProductCarouselProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  linkLabel: string;
  href?: string;
  products: Product[];
  tone?: "default" | "soft";
};

export function HomeProductCarousel({
  eyebrow = "Discover",
  title,
  description,
  linkLabel,
  href = "/categories",
  products,
  tone = "default",
}: HomeProductCarouselProps) {
  const trackRef = useRef<HTMLDivElement | null>(null);

  if (products.length === 0) {
    return null;
  }

  function scrollByCards(direction: "left" | "right") {
    const track = trackRef.current;

    if (!track) {
      return;
    }

    const amount = Math.max(280, Math.round(track.clientWidth * 0.8));

    track.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  }

  const isCompactShelf = products.length <= 3;

  return (
    <section
      className={
        tone === "soft"
          ? "home-product-section mt-12 rounded-[28px] border border-orange-100 bg-orange-50/40 px-4 py-6 sm:mt-16 sm:px-6 sm:py-8"
          : "home-product-section mt-12 sm:mt-16"
      }
    >
      <div className="mb-5 flex items-end justify-between gap-4 sm:mb-6">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-600">
            {eyebrow}
          </p>

          <h2 className="mt-1 text-2xl font-bold tracking-tight text-zinc-950 sm:text-3xl">
            {title}
          </h2>

          {description ? (
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600 sm:text-base">
              {description}
            </p>
          ) : null}
        </div>

        <Link
          href={href}
          className="hidden shrink-0 text-sm font-bold text-orange-600 transition hover:text-orange-700 sm:inline-flex"
        >
          {linkLabel} →
        </Link>
      </div>

      <div className="relative">
        <div
          ref={trackRef}
          className={
            isCompactShelf
              ? "home-product-track home-product-track-compact"
              : "home-product-track"
          }
          aria-label={`${title} products`}
        >
          {products.map((product, index) => (
            <div key={`${product.slug}-${index}`} className="home-product-item">
              <ProductCard product={product} index={index + 1} />
            </div>
          ))}
        </div>

        {products.length > 3 ? (
          <div className="mt-4 flex items-center justify-between">
            <Link
              href={href}
              className="text-sm font-bold text-orange-600 transition hover:text-orange-700 sm:hidden"
            >
              {linkLabel} →
            </Link>

            <div className="ml-auto flex items-center gap-2">
              <button
                type="button"
                onClick={() => scrollByCards("left")}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 bg-white text-lg text-zinc-700 shadow-sm transition hover:border-orange-300 hover:text-orange-600"
                aria-label={`Scroll ${title} left`}
              >
                ←
              </button>

              <button
                type="button"
                onClick={() => scrollByCards("right")}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 bg-white text-lg text-zinc-700 shadow-sm transition hover:border-orange-300 hover:text-orange-600"
                aria-label={`Scroll ${title} right`}
              >
                →
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
