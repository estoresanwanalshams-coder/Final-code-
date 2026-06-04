import { ProductCard } from "@/components/ProductCard";
import type { CategorySlug } from "@/lib/categories";
import { fetchSupabaseProductsPage } from "@/lib/supabase-products";
import Link from "next/link";

type ProductGridProps = {
  categorySlug?: CategorySlug;
  page?: number;
  pageSize?: number;
  basePath?: string;
};

function createPageHref(basePath: string, page: number) {
  return page <= 1 ? basePath : `${basePath}?page=${page}`;
}

export async function ProductGrid({
  categorySlug,
  page = 1,
  pageSize = 24,
  basePath = "/categories",
}: ProductGridProps) {
  const currentPage = Math.max(1, page);
  const {
    products: visibleProducts,
    hasNextPage,
    totalPages,
  } = await fetchSupabaseProductsPage({
    categorySlug,
    page: currentPage,
    pageSize,
  }).catch(() => ({ products: [], hasNextPage: false, totalPages: 1, currentPage }));

  if (visibleProducts.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-8 text-center text-zinc-600">
        No products available yet. Add products from the admin panel.
      </div>
    );
  }

  return (
    <>
      <div className="product-grid">
        {visibleProducts.map((product, index) => (
          <ProductCard key={product.slug} product={product} index={index + 1} />
        ))}
      </div>
      <nav
        className="mt-8 flex items-center justify-center gap-3"
        aria-label="Product pagination"
      >
        {currentPage > 1 ? (
          <Link
            href={createPageHref(basePath, currentPage - 1)}
            className="border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-900 transition hover:border-zinc-900"
          >
            Previous
          </Link>
        ) : null}
        <span className="text-sm font-semibold text-zinc-600">
          Page {currentPage}
        </span>
        <div className="flex items-center gap-2">
          {Array.from({ length: totalPages }, (_, index) => index + 1)
            .slice(Math.max(0, currentPage - 3), Math.max(0, currentPage - 3) + 5)
            .map((pageNumber) => (
              <Link
                key={pageNumber}
                href={createPageHref(basePath, pageNumber)}
                className={`border px-3 py-2 text-sm font-semibold transition ${
                  pageNumber === currentPage
                    ? "border-zinc-900 bg-zinc-900 text-white"
                    : "border-zinc-300 text-zinc-900 hover:border-zinc-900"
                }`}
              >
                {pageNumber}
              </Link>
            ))}
        </div>
        {hasNextPage ? (
          <Link
            href={createPageHref(basePath, currentPage + 1)}
            className="border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-900 transition hover:border-zinc-900"
          >
            Next
          </Link>
        ) : null}
      </nav>
    </>
  );
}
