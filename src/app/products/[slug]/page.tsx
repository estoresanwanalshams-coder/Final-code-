import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/ProductCard";
import { ProductActionBar } from "@/components/ProductActionBar";
import { ProductMediaGallery } from "@/components/ProductMediaGallery";
import { categories, getCategoryBySlug } from "@/lib/categories";
import { fetchMergedCategories } from "@/lib/supabase-categories";
import {
  fetchSupabaseProductBySlug,
  fetchSupabaseRelatedProducts,
} from "@/lib/supabase-products";
import { ProductTrustPanel } from "@/components/ProductTrustPanel";

type ProductPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const revalidate = 120;

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await fetchSupabaseProductBySlug(slug).catch(() => null);

  if (!product) {
    return {
      title: "Product not found",
    };
  }

  return {
    title: product.name,
    description: product.summary || product.details?.slice(0, 160),
    openGraph: {
      title: product.name,
      description: product.summary || product.details?.slice(0, 160),
      images: [
        {
          url: product.imageUrl,
          alt: product.name,
        },
      ],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const [product, allCategories] = await Promise.all([
    fetchSupabaseProductBySlug(slug).catch(() => null),
    fetchMergedCategories().catch(() => categories),
  ]);

  if (!product) {
    notFound();
  }

  const category = getCategoryBySlug(product.categorySlug, allCategories);
  const relatedProducts = await fetchSupabaseRelatedProducts(
    product.categorySlug,
    product.slug,
    4,
  ).catch(() => []);

  return (
    <section className="page-shell bg-zinc-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1fr_1fr]">
          <ProductMediaGallery
            images={product.imageUrls ?? [product.imageUrl]}
            videoUrl={product.videoUrl}
          />

          <div className="flex flex-col">
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6">
              {category?.name ? (
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-orange-600">
                  {category.name}
                </p>
              ) : null}

              <h1 className="mt-3 text-2xl font-bold leading-tight text-zinc-950 sm:text-3xl">
                {product.name}
              </h1>

              {product.summary ? (
                <p className="mt-4 whitespace-pre-line text-[13px] leading-6 text-zinc-600 sm:text-sm sm:leading-7">
                  {product.summary}
                </p>
              ) : null}

              <div className="mt-6 border-t border-zinc-100 pt-5">
                {product.actualPrice && product.actualPrice > product.price ? (
                  <div className="mb-1 flex flex-wrap items-center gap-3">
                    <span className="text-sm text-zinc-500 line-through">
                      AED {product.actualPrice}
                    </span>

                    <span className="rounded-md bg-orange-50 px-2 py-1 text-xs font-bold text-orange-700">
                      Save AED{" "}
                      {(product.actualPrice - product.price).toFixed(0)}
                    </span>
                  </div>
                ) : null}

                <p className="text-3xl font-bold tracking-tight text-zinc-950">
                  AED {product.price}
                </p>

                {product.freeShipping ? (
                  <p className="mt-3 inline-flex rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-emerald-700">
                    Free Shipping
                  </p>
                ) : null}
              </div>

              <ProductActionBar product={product} />
              <ProductTrustPanel />
            </div>
          </div>
        </div>

        <div className="mt-10 overflow-hidden rounded-2xl border border-zinc-200 bg-white">
          <div className="border-b border-zinc-100 px-5 py-5 sm:px-7">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-orange-600">
              About this product
            </p>

            <h2 className="mt-1 text-xl font-bold text-zinc-950 sm:text-2xl">
              Product Details
            </h2>
          </div>

          <div className="px-5 py-5 sm:px-7 sm:py-6">
            <p className="max-w-5xl whitespace-pre-line text-[13px] leading-6 text-zinc-700 sm:text-sm sm:leading-7">
              {product.details}
            </p>
          </div>

          <div className="grid border-t border-zinc-100 sm:grid-cols-3">
            <div className="border-b border-zinc-100 px-5 py-4 sm:border-b-0 sm:border-r sm:px-7">
              <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">
                Delivery
              </p>
              <p className="mt-1 text-sm font-semibold text-zinc-900">
                Available across the UAE
              </p>
            </div>

            <div className="border-b border-zinc-100 px-5 py-4 sm:border-b-0 sm:border-r sm:px-7">
              <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">
                Payment
              </p>
              <p className="mt-1 text-sm font-semibold text-zinc-900">
                Cash on Delivery
              </p>
            </div>

            <div className="px-5 py-4 sm:px-7">
              <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">
                Need Help?
              </p>
              <p className="mt-1 text-sm font-semibold text-zinc-900">
                Contact us on WhatsApp
              </p>
            </div>
          </div>
        </div>

        {relatedProducts.length > 0 ? (
          <div className="mt-14">
            <h2 className="text-2xl font-bold text-zinc-950">
              Related Products
            </h2>
            <div className="mt-7 grid grid-cols-2 gap-4 lg:grid-cols-4">
              {relatedProducts.map((relatedProduct, index) => (
                <ProductCard
                  key={relatedProduct.slug}
                  product={relatedProduct}
                  index={index + 1}
                />
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
