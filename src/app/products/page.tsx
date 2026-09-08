import { Suspense } from "react";
import { ProductGrid } from "@/components/ProductGrid";
import { ProductGridSkeleton } from "@/components/ProductGridSkeleton";
import type { ProductSort } from "@/lib/supabase-products";
import { ProductCategoryNav } from "@/components/ProductCategoryNav";
import { fetchMergedCategories } from "@/lib/supabase-categories";
import { categories } from "@/lib/categories";

type ProductsPageProps = {
  searchParams: Promise<{
    page?: string;
    sort?: string;
  }>;
};

export const revalidate = 120;

export const metadata = {
  title: "All Products | HM shop online",
  description: "Browse all products from HM shop online.",
};

function parsePage(page?: string) {
  const parsed = Number(page ?? "1");
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 1;
}
function parseSort(sort?: string): ProductSort {
  switch (sort) {
    case "price-asc":
    case "price-desc":
    case "name-asc":
      return sort;

    default:
      return "newest";
  }
}

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const { page, sort } = await searchParams;
  const currentPage = parsePage(page);
  const currentSort = parseSort(sort);
  const allCategories = await fetchMergedCategories().catch(() => categories);

  return (
    <section className="page-shell bg-zinc-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="content-reveal">
          <p className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
            Shop
          </p>
          <h1 className="mt-3 text-3xl font-bold text-zinc-950 sm:text-4xl">
            All Products
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-600">
            Explore our full catalog, including new arrivals and latest
            additions.
          </p>
          <div className="mt-8">
            <ProductCategoryNav categoryList={allCategories} />
          </div>
          <div className="mt-8">
            <Suspense fallback={<ProductGridSkeleton count={24} />}>
              <ProductGrid
                page={currentPage}
                pageSize={24}
                basePath="/products"
                sort={currentSort}
              />
            </Suspense>
          </div>
        </div>
      </div>
    </section>
  );
}
