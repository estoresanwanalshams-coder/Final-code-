"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

type ProductMediaGalleryProps = {
  images: string[];
  videoUrl?: string;
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

export function ProductMediaGallery({ images, videoUrl }: ProductMediaGalleryProps) {
  const safeImages = images.length > 0 ? images : ["/placeholder-product.png"];
  const [activeImage, setActiveImage] = useState(safeImages[0]);
  const embedUrl = useMemo(() => getYouTubeEmbedUrl(videoUrl), [videoUrl]);

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="product-image relative aspect-square overflow-hidden rounded-xl bg-zinc-100">
        <Image
          src={activeImage}
          alt="Product image"
          fill
          sizes="(max-width: 1024px) 90vw, 45vw"
          className="object-cover"
          loading="lazy"
        />
      </div>
      <div className="mt-4 grid grid-cols-5 gap-2">
        {safeImages.map((image) => (
          <button
            key={image}
            type="button"
            onClick={() => setActiveImage(image)}
            className={`relative aspect-square overflow-hidden rounded-lg transition ${
              activeImage === image ? "ring-2 ring-zinc-900" : "ring-1 ring-transparent"
            }`}
            aria-label="Preview product image"
          >
            <Image
              src={image}
              alt="Product thumbnail"
              fill
              sizes="120px"
              className="object-cover"
              loading="lazy"
            />
          </button>
        ))}
      </div>
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
