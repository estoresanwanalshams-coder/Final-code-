import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import {
  fetchSupabaseSearchProducts,
  type ProductSort,
} from "@/lib/supabase-products";

type SearchResultsProps = {
  query: string;
  page?: number;
  sort?: ProductSort;
};

const sortOptions: Array<{
  value: ProductSort;
  label: string;
}> = [
  {
    value: "newest",
    label: "Newest",
  },
  {
    value: "price-asc",
    label: "Price: Low to High",
  },
  {
    value: "price-desc",
    label: "Price: High to Low",
  },
  {
    value: "name-asc",
    label: "Name: A–Z",
  },
];

function createSearchPageHref(
  query: string,
  page: number,
  sort: ProductSort,
) {
  const params = new URLSearchParams();

  if (query) {
    params.set("q", query);
  }

  if (sort !== "newest") {
    params.set("sort", sort);
  }

  if (page > 1) {
    params.set("page", String(page));
  }

  const queryString = params.toString();

  return queryString ? `/search?${queryString}` : "/search";
}

export async function SearchResults({
  query,
  page = 1,
  sort = "newest",
}: SearchResultsProps) {
  const currentPage = Math.max(1, page);
  const normalizedQuery = query.trim();

  const {
    products: results,
    hasNextPage,
    totalPages,
    totalCount,
  } = await fetchSupabaseSearchProducts(normalizedQuery, {
    page: currentPage,
    pageSize: 24,
    sort,
  }).catch(() => ({
    products: [],
    hasNextPage: false,
    totalPages: 1,
    currentPage,
    totalCount: 0,
  }));

  if (results.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-8 text-center shadow-sm sm:p-10">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-orange-50 text-xl">
          🔎
        </div>

        <h2 className="mt-4 text-xl font-bold text-zinc-950">
          No products found
        </h2>

        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-600">
          We couldn&apos;t find products matching{" "}
          <span className="font-semibold text-zinc-900">
            &quot;{normalizedQuery}&quot;
          </span>
          . Try a different product name or browse all products.
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href="/products"
            className="rounded-xl bg-[#fa710c] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#e66000]"
          >
            Browse All Products
          </Link>

          <Link
            href="/categories"
            className="rounded-xl border border-zinc-300 bg-white px-5 py-3 text-sm font-bold text-zinc-900 transition hover:border-zinc-900"
          >
            Browse Categories
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-bold text-zinc-950">
            {totalCount} {totalCount === 1 ? "Result" : "Results"}
          </p>

          <p className="mt-1 text-xs text-zinc-500">
            Showing page {currentPage} of {totalPages}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {sortOptions.map((option) => (
            <Link
              key={option.value}
              href={createSearchPageHref(normalizedQuery, 1, option.value)}
              className={`rounded-lg border px-3 py-2 text-xs font-bold transition ${
                sort === option.value
                  ? "border-[#fa710c] bg-orange-50 text-orange-700"
                  : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-400"
              }`}
            >
              {option.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="product-grid">
        {results.map((product, index) => (
          <ProductCard
            key={product.slug}
            product={product}
            index={index + 1}
          />
        ))}
      </div>

      {totalPages > 1 ? (
        <nav
          className="mt-8 flex flex-wrap items-center justify-center gap-2"
          aria-label="Search pagination"
        >
          {currentPage > 1 ? (
            <Link
              href={createSearchPageHref(
                normalizedQuery,
                currentPage - 1,
                sort,
              )}
              className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-900 transition hover:border-zinc-900"
            >
              Previous
            </Link>
          ) : null}

          {Array.from({ length: totalPages }, (_, index) => index + 1)
            .slice(
              Math.max(0, currentPage - 3),
              Math.max(0, currentPage - 3) + 5,
            )
            .map((pageNumber) => (
              <Link
                key={pageNumber}
                href={createSearchPageHref(
                  normalizedQuery,
                  pageNumber,
                  sort,
                )}
                className={`rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                  pageNumber === currentPage
                    ? "border-zinc-950 bg-zinc-950 text-white"
                    : "border-zinc-300 bg-white text-zinc-900 hover:border-zinc-900"
                }`}
              >
                {pageNumber}
              </Link>
            ))}

          {hasNextPage ? (
            <Link
              href={createSearchPageHref(
                normalizedQuery,
                currentPage + 1,
                sort,
              )}
              className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-900 transition hover:border-zinc-900"
            >
              Next
            </Link>
          ) : null}
        </nav>
      ) : null}
    </>
  );
}