"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { homeBannerSlides } from "@/lib/banners";

type HomeBannerCarouselProps = {
  extraBannerUrl?: string;
};

export function HomeBannerCarousel({ extraBannerUrl }: HomeBannerCarouselProps) {
  const slides = useMemo(() => {
    const urls = [...homeBannerSlides];

    if (
      extraBannerUrl &&
      extraBannerUrl.startsWith("/") &&
      !urls.includes(extraBannerUrl)
    ) {
      urls.unshift(extraBannerUrl);
    }

    return urls;
  }, [extraBannerUrl]);

  const [activeIndex, setActiveIndex] = useState(0);

  function goToPrevious() {
    setActiveIndex((current) => (current === 0 ? slides.length - 1 : current - 1));
  }

  function goToNext() {
    setActiveIndex((current) => (current + 1) % slides.length);
  }

  useEffect(() => {
    if (slides.length <= 1) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="banner-carousel content-reveal">
      <div
        className="banner-carousel-track"
        style={{ transform: `translateX(-${activeIndex * 100}%)` }}
      >
        {slides.map((slide) => (
          <div key={slide} className="banner-carousel-slide">
            <Image
              src={slide}
              alt="Store banner"
              fill
              loading={slide === slides[0] ? "eager" : "lazy"}
              priority={slide === slides[0]}
              sizes="100vw"
              className="object-cover"
            />
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
                key={slide}
                type="button"
                aria-label={`Show banner ${index + 1}`}
                className={index === activeIndex ? "is-active" : ""}
                onClick={() => setActiveIndex(index)}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
