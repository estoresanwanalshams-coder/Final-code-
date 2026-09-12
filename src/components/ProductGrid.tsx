import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import type { CategorySlug } from "@/lib/categories";
import {
  fetchSupabaseProductsPage,
  type ProductSort,
} from "@/lib/supabase-products";

type ProductGridProps = {
  categorySlug?: CategorySlug;
  page?: number;
  pageSize?: number;
  basePath?: string;
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

function createBrowseHref(
  basePath: string,
  page: number,
  sort: ProductSort,
) {
  const params = new URLSearchParams();

  if (sort !== "newest") {
    params.set("sort", sort);
  }

  if (page > 1) {
    params.set("page", String(page));
  }

  const query = params.toString();

  return query ? `${basePath}?${query}` : basePath;
}

export async function ProductGrid({
  categorySlug,
  page = 1,
  pageSize = 24,
  basePath = "/products",
  sort = "newest",
}: ProductGridProps) {
  const currentPage = Math.max(1, page);

  const {
    products: visibleProducts,
    hasNextPage,
    totalPages,
    totalCount,
  } = await fetchSupabaseProductsPage({
    categorySlug,
    page: currentPage,
    pageSize,
    sort,
  }).catch(() => ({
    products: [],
    hasNextPage: false,
    totalPages: 1,
    currentPage,
    totalCount: 0,
  }));

  if (visibleProducts.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-8 text-center">
        <h2 className="text-lg font-bold text-zinc-950">
          No products available yet
        </h2>

        <p className="mt-2 text-sm leading-6 text-zinc-600">
          Please check another category or come back soon for new arrivals.
        </p>

        <Link
          href="/products"
          className="mt-5 inline-flex rounded-xl bg-hm-orange px-5 py-3 text-sm font-bold text-white transition hover:bg-hm-orange-hover"
        >
          Browse All Products
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-bold text-zinc-950">
            {totalCount} {totalCount === 1 ? "Product" : "Products"}
          </p>

          <p className="mt-1 text-xs text-zinc-500">
            Showing page {currentPage} of {totalPages}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {sortOptions.map((option) => (
            <Link
              key={option.value}
              href={createBrowseHref(basePath, 1, option.value)}
              className={`rounded-lg border px-3 py-2 text-xs font-bold transition ${
                sort === option.value
                  ? "border-hm-orange bg-orange-50 text-orange-700"
                  : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-400"
              }`}
            >
              {option.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="product-grid">
        {visibleProducts.map((product, index) => (
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
          aria-label="Product pagination"
        >
          {currentPage > 1 ? (
            <Link
              href={createBrowseHref(basePath, currentPage - 1, sort)}
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
                href={createBrowseHref(basePath, pageNumber, sort)}
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
              href={createBrowseHref(basePath, currentPage + 1, sort)}
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