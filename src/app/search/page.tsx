import { Suspense } from "react";
import { ProductGridSkeleton } from "@/components/ProductGridSkeleton";
import { SearchResults } from "@/components/SearchResults";
import type { ProductSort } from "@/lib/supabase-products";

type SearchPageProps = {
  searchParams: Promise<{
    q?: string;
    page?: string;
    sort?: string;
  }>;
};

export const revalidate = 120;

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

export const metadata = {
  title: "Search Products | HM Shop Online",
  description:
    "Search home, kitchen, gadgets, baby, automotive, health, beauty, and everyday products available from HM Shop Online in the UAE.",
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q = "", page, sort } = await searchParams;
  const currentPage = parsePage(page);
  const currentSort = parseSort(sort);

  return (
    <section className="page-shell">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <p className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
          Product search
        </p>
        <h1 className="mt-3 text-4xl font-bold text-zinc-950">
          Search results
        </h1>
        <p className="mt-4 max-w-2xl text-zinc-600">
          Showing products for {q ? `"${q}"` : "all products"}.
        </p>
        <div className="mt-8">
          <Suspense fallback={<ProductGridSkeleton count={8} />}>
            <SearchResults query={q} page={currentPage} sort={currentSort} />
          </Suspense>
        </div>
      </div>
    </section>
  );
}
