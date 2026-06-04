import Image from "next/image";
import Link from "next/link";
import { AddToCartButton } from "@/components/AddToCartButton";
import type { Product } from "@/lib/products";

type ProductCardProps = {
  product: Product;
  index: number;
};

export function ProductCard({ product, index }: ProductCardProps) {
  const images = Array.from(
    new Set([product.imageUrl, ...(product.imageUrls ?? [])].filter(Boolean)),
  );
  const primaryImage = images[0] ?? product.imageUrl;
  const secondaryImage = images[1];

  return (
    <article
      className="product-card group flex h-full flex-col overflow-hidden bg-white"
      style={{ animationDelay: `${index * 70}ms` }}
    >
      <Link
        href={`/products/${product.slug}`}
        className="product-card-media block shrink-0"
      >
        <div className="product-image relative aspect-[4/3] overflow-hidden bg-zinc-100">
          <Image
            src={primaryImage}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            loading="lazy"
          />
          {secondaryImage ? (
            <Image
              src={secondaryImage}
              alt={`${product.name} alternate view`}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              loading="lazy"
            />
          ) : null}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/15 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-3.5">
        <Link
          href={`/products/${product.slug}`}
          className="block flex-1"
        >
          <h3 className="line-clamp-2 min-h-[2.75rem] text-[0.98rem] font-bold leading-snug text-zinc-950">
            {product.name}
          </h3>
        </Link>
        <div className="mt-3 flex items-center justify-between gap-2">
          <Link
            href={`/products/${product.slug}`}
            className="flex flex-col"
          >
            {product.actualPrice && product.actualPrice > product.price ? (
              <span className="text-xs text-zinc-500 line-through">
                AED {product.actualPrice}
              </span>
            ) : null}
            <span className="text-base font-bold text-zinc-950">AED {product.price}</span>
          </Link>
          <AddToCartButton
            product={product}
            label="Add to Cart"
            className="btn-soft px-2.5 py-2 text-xs sm:px-3 sm:text-sm"
          />
        </div>
      </div>
    </article>
  );
}
