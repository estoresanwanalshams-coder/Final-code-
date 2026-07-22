"use client";

import Image, { type ImageProps } from "next/image";
import { useEffect, useState } from "react";

type SafeProductImageProps = Omit<ImageProps, "src" | "alt" | "onError"> & {
  src?: string | null;
  alt: string;
};

export function SafeProductImage({
  src,
  alt,
  className,
  onLoad,
  ...props
}: SafeProductImageProps) {
  const initialSrc = src && String(src).trim() ? String(src).trim() : "";
  const [currentSrc, setCurrentSrc] = useState(initialSrc);
  const [failed, setFailed] = useState(!initialSrc);

  useEffect(() => {
    setCurrentSrc(initialSrc);
    setFailed(!initialSrc);
  }, [initialSrc]);

  if (failed || !currentSrc) {
    return (
      <div
        aria-label={alt}
        className={`flex items-center justify-center bg-zinc-100 text-xs font-semibold text-zinc-400 ${className ?? ""}`}
        style={
          props.fill
            ? { position: "absolute", inset: 0 }
            : undefined
        }
      >
        No image
      </div>
    );
  }

  return (
    <Image
      {...props}
      src={currentSrc}
      alt={alt}
      className={className}
      onLoad={onLoad}
      onError={() => setFailed(true)}
    />
  );
}
