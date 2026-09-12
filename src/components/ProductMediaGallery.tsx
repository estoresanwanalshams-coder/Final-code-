"use client";

import { useMemo, useState } from "react";
import { SafeProductImage } from "@/components/SafeProductImage";

type ProductMediaGalleryProps = {
  images: string[];
  videoUrl?: string;
  productName?: string;
};

function getYouTubeEmbedUrl(url?: string) {
  if (!url) {
    return "";
  }
  const trimmed = url.trim();

  // Accept direct video id as well.
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return `https://www.youtube.com/embed/${trimmed}`;
  }

  try {
    const parsed = new URL(trimmed);
    const host = parsed.hostname.toLowerCase();

    if (host.includes("youtu.be")) {
      const id = parsed.pathname.replace("/", "").split("/")[0];
      return id ? `https://www.youtube.com/embed/${id}` : "";
    }

    if (host.includes("youtube.com")) {
      const v = parsed.searchParams.get("v");
      if (v) {
        return `https://www.youtube.com/embed/${v}`;
      }

      const parts = parsed.pathname.split("/").filter(Boolean);
      const markerIndex = parts.findIndex((part) =>
        ["embed", "shorts", "live"].includes(part),
      );
      if (markerIndex >= 0 && parts[markerIndex + 1]) {
        return `https://www.youtube.com/embed/${parts[markerIndex + 1]}`;
      }
    }
  } catch {
    return "";
  }

  return "";
}

export function ProductMediaGallery({
  images,
  videoUrl,
  productName = "Product",
}: ProductMediaGalleryProps) {
  const safeImages = useMemo(
    () => (images.length > 0 ? images.filter(Boolean) : []),
    [images],
  );
  const [activeImage, setActiveImage] = useState(safeImages[0] ?? "");
  const embedUrl = useMemo(() => getYouTubeEmbedUrl(videoUrl), [videoUrl]);

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="product-image relative aspect-square w-full overflow-hidden rounded-xl bg-zinc-50">
        <SafeProductImage
          key={activeImage || "empty"}
          src={activeImage}
          alt={productName}
          fill
          loading="eager"
          sizes="(max-width: 1024px) 90vw, 45vw"
          className="object-contain"
        />
      </div>
      {safeImages.length > 0 ? (
        <div className="mt-4 flex gap-3 overflow-x-auto px-0.5 py-0.5 pb-2">
          {safeImages.map((image, index) => (
            <button
              key={image}
              type="button"
              onClick={() => setActiveImage(image)}
              className={`relative aspect-square w-16 shrink-0 overflow-hidden rounded-lg border-2 bg-zinc-50 transition sm:w-20 ${
                activeImage === image
                  ? "border-hm-orange"
                  : "border-zinc-200 hover:border-zinc-300"
              }`}
              aria-label={`View product image ${index + 1}`}
            >
              <SafeProductImage
                src={image}
                alt={`${productName} thumbnail ${index + 1}`}
                fill
                loading={index === 0 ? "eager" : "lazy"}
                sizes="120px"
                className="object-contain"
              />
            </button>
          ))}
        </div>
      ) : null}
      {embedUrl ? (
        <div className="mt-5 overflow-hidden rounded-xl">
          <iframe
            className="aspect-video w-full"
            src={embedUrl}
            title="Product video"
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : null}
    </div>
  );
}
