"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { HomepageBanner } from "@/lib/site-settings";
import Link from "next/link";

type HomeBannerCarouselProps = {
  banners: HomepageBanner[];
};

export function HomeBannerCarousel({ banners }: HomeBannerCarouselProps) {
  const slides = banners
    .filter((banner) => banner.isActive && banner.imageUrl.trim())
    .sort((a, b) => a.displayOrder - b.displayOrder);

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (activeIndex >= slides.length) {
      setActiveIndex(0);
    }
  }, [activeIndex, slides.length]);

  useEffect(() => {
    if (slides.length <= 1) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, [slides.length]);

  if (slides.length === 0) {
    return null;
  }

  function goToPrevious() {
    setActiveIndex((current) =>
      current === 0 ? slides.length - 1 : current - 1,
    );
  }

  function goToNext() {
    setActiveIndex((current) => (current + 1) % slides.length);
  }

  return (
    <section className="banner-carousel content-reveal">
      <div
        className="banner-carousel-track"
        style={{
          transform: `translateX(-${activeIndex * 100}%)`,
        }}
      >
        {slides.map((slide, index) => (
          <div key={slide.id} className="banner-carousel-slide">
            {slide.linkUrl ? (
              <Link
                href={slide.linkUrl}
                className="absolute inset-0 z-[1] block cursor-pointer"
                aria-label={`Open banner ${index + 1}`}
              >
                <Image
                  src={slide.imageUrl}
                  alt={`HM Shop Online banner ${index + 1}`}
                  fill
                  unoptimized
                  loading={index === 0 ? "eager" : "lazy"}
                  priority={index === 0}
                  sizes="100vw"
                  className="object-cover"
                />
              </Link>
            ) : (
              <Image
                src={slide.imageUrl}
                alt={`HM Shop Online banner ${index + 1}`}
                fill
                unoptimized
                loading={index === 0 ? "eager" : "lazy"}
                priority={index === 0}
                sizes="100vw"
                className="object-cover"
              />
            )}
          </div>
        ))}
      </div>

      {slides.length > 1 ? (
        <>
          <button
            type="button"
            className="banner-nav banner-nav-left"
            onClick={goToPrevious}
            aria-label="Show previous banner"
          >
            ←
          </button>

          <button
            type="button"
            className="banner-nav banner-nav-right"
            onClick={goToNext}
            aria-label="Show next banner"
          >
            →
          </button>

          <div className="banner-carousel-dots">
            {slides.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                aria-label={`Show banner ${index + 1}`}
                className={index === activeIndex ? "is-active" : ""}
                onClick={() => setActiveIndex(index)}
              />
            ))}
          </div>
        </>
      ) : null}
    </section>
  );
}
