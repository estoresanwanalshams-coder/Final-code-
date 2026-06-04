import { Suspense } from "react";
import { ProductGridSkeleton } from "@/components/ProductGridSkeleton";
import { SearchResults } from "@/components/SearchResults";

type SearchPageProps = {
  searchParams: Promise<{
    q?: string;
    page?: string;
  }>;
};

export const revalidate = 120;

function parsePage(page?: string) {
  const parsed = Number(page ?? "1");
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 1;
}

export const metadata = {
  title: "Search Products | GCC General Products Store",
  description:
    "Search home, kitchen, electronic gadgets, baby toys, automotive, health, and beauty products available for GCC customers.",
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q = "", page } = await searchParams;
  const currentPage = parsePage(page);

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
            <SearchResults query={q} page={currentPage} />
          </Suspense>
        </div>
      </div>
    </section>
  );
}
