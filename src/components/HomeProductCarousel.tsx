"use client";

import Link from "next/link";
import { useRef } from "react";
import { ProductCard } from "@/components/ProductCard";
import type { Product } from "@/lib/products";

type HomeProductCarouselProps = {
  title: string;
  linkLabel: string;
  href?: string;
  products: Product[];
};

export function HomeProductCarousel({
  title,
  linkLabel,
  href = "/categories",
  products,
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

  return (
    <section className="home-product-section mt-14">
      <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h2 className="text-3xl font-bold text-zinc-950">
            {title}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => scrollByCards("left")}
            className="slider-arrow"
            aria-label={`Scroll ${title} left`}
          >
            ←
          </button>

          <button
            type="button"
            onClick={() => scrollByCards("right")}
            className="slider-arrow"
            aria-label={`Scroll ${title} right`}
          >
            →
          </button>

          <Link
            href={href}
            className="text-sm font-bold text-zinc-950"
          >
            {linkLabel}
          </Link>
        </div>
      </div>

      <div
        ref={trackRef}
        className="home-product-track"
        aria-label={`${title} products`}
      >
        {products.map((product, index) => (
          <div
            key={`${product.slug}-${index}`}
            className="home-product-item"
          >
            <ProductCard
              product={product}
              index={index + 1}
            />
          </div>
        ))}
      </div>
    </section>
  );
}