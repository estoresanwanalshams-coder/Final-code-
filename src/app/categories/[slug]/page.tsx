import { Suspense } from "react";
import { ProductGrid } from "@/components/ProductGrid";
import { ProductGridSkeleton } from "@/components/ProductGridSkeleton";
import { categories, getCategoryBySlug } from "@/lib/categories";
import { fetchMergedCategories } from "@/lib/supabase-categories";

type CategoryPageProps = {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    page?: string;
  }>;
};

export const revalidate = 120;

function parsePage(page?: string) {
  const parsed = Number(page ?? "1");
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 1;
}

export async function generateStaticParams() {
  const mergedCategories = await fetchMergedCategories().catch(() => categories);

  return mergedCategories.map((category) => ({
    slug: category.slug,
  }));
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const { slug } = await params;
  const { page } = await searchParams;
  const currentPage = parsePage(page);
  const allCategories = await fetchMergedCategories().catch(() => categories);
  const category = getCategoryBySlug(slug, allCategories) ?? {
    name: slug
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" "),
    slug,
    description: "Browse available products in this category.",
  };

  return (
    <section className="page-shell bg-zinc-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="content-reveal">
          <p className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
            Category
          </p>
          <h1 className="mt-3 text-3xl font-bold text-zinc-950 sm:text-4xl">
            {category.name}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-600">
            {category.description}
          </p>

          <div className="mt-8">
            <Suspense fallback={<ProductGridSkeleton count={24} />}>
              <ProductGrid
                categorySlug={category.slug}
                page={currentPage}
                pageSize={24}
                basePath={`/categories/${category.slug}`}
              />
            </Suspense>
          </div>
        </div>
      </div>
    </section>
  );
}
