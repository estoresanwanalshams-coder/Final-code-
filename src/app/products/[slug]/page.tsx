import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FeatureHighlights } from "@/components/FeatureHighlights";
import { ProductCard } from "@/components/ProductCard";
import { ProductActionBar } from "@/components/ProductActionBar";
import { ProductMediaGallery } from "@/components/ProductMediaGallery";
import { categories, getCategoryBySlug } from "@/lib/categories";
import { fetchMergedCategories } from "@/lib/supabase-categories";
import {
  fetchSupabaseProductBySlug,
  fetchSupabaseRelatedProducts,
} from "@/lib/supabase-products";

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
        <div className="content-reveal grid gap-10 lg:grid-cols-[1fr_1fr]">
          <ProductMediaGallery
            images={product.imageUrls ?? [product.imageUrl]}
            videoUrl={product.videoUrl}
          />

          <div className="flex flex-col justify-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
              {category?.name}
            </p>
            <h1 className="mt-3 text-xl font-bold text-zinc-950 sm:text-2xl">
              {product.name}
            </h1>
            <p className="mt-4 whitespace-pre-line text-sm leading-6 text-zinc-600">
              {product.summary}
            </p>
            <div className="mt-5">
              {product.actualPrice && product.actualPrice > product.price ? (
                <p className="text-sm text-zinc-500 line-through">
                  AED {product.actualPrice}
                </p>
              ) : null}
              <p className="text-xl font-bold text-zinc-950">AED {product.price}</p>
            </div>
            <ProductActionBar product={product} />
            <div className="mt-6">
              <FeatureHighlights compact />
            </div>
          </div>
        </div>

        <div className="mt-10 rounded-xl border border-zinc-200 bg-white p-5">
          <h2 className="text-xl font-bold text-zinc-950">Product Details</h2>
          <p className="mt-3 whitespace-pre-line text-sm leading-7 text-zinc-700">
            {product.details}
          </p>
        </div>

        {relatedProducts.length > 0 ? (
          <div className="mt-14">
            <h2 className="text-3xl font-bold text-zinc-950">Related products</h2>
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
