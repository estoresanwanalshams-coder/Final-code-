"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Product } from "@/lib/products";
import {
  deleteSupabaseProduct,
  fetchSupabaseProducts,
} from "@/lib/supabase-products";

const PRODUCTS_PER_PAGE = 25;

type StatusFilter = "all" | "active" | "draft";
type StockFilter = "all" | "in_stock" | "out_of_stock";

export function AdminProductsManager({
  initialProducts,
}: {
  initialProducts: Product[];
}) {
  const [products, setProducts] = useState(initialProducts);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadAdminProducts() {
      try {
        const nextProducts = await fetchSupabaseProducts();

        if (active) {
          setProducts(nextProducts);
        }
      } finally {
        if (active) {
          setIsLoadingProducts(false);
        }
      }
    }

    void loadAdminProducts();

    return () => {
      active = false;
    };
  }, []);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [stockFilter, setStockFilter] = useState<StockFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [message, setMessage] = useState("");
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);

  const categories = useMemo(() => {
    return Array.from(
      new Set(products.map((product) => product.categorySlug)),
    ).sort();
  }, [products]);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.slug.toLowerCase().includes(query) ||
        (product.sku ?? "").toLowerCase().includes(query) ||
        (product.brand ?? "").toLowerCase().includes(query) ||
        product.categorySlug.toLowerCase().includes(query) ||
        (product.searchKeywords ?? []).some((keyword) =>
          keyword.toLowerCase().includes(query),
        );

      const matchesStatus =
        statusFilter === "all" || (product.status ?? "active") === statusFilter;

      const matchesStock =
        stockFilter === "all" ||
        (product.stockStatus ?? "in_stock") === stockFilter;

      const matchesCategory =
        categoryFilter === "all" || product.categorySlug === categoryFilter;

      return matchesSearch && matchesStatus && matchesStock && matchesCategory;
    });
  }, [products, search, statusFilter, stockFilter, categoryFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE),
  );

  const safePage = Math.min(currentPage, totalPages);

  const visibleProducts = filteredProducts.slice(
    (safePage - 1) * PRODUCTS_PER_PAGE,
    safePage * PRODUCTS_PER_PAGE,
  );

  const stats = useMemo(() => {
    return {
      total: products.length,
      active: products.filter(
        (product) => (product.status ?? "active") === "active",
      ).length,
      draft: products.filter(
        (product) => (product.status ?? "active") === "draft",
      ).length,
      inStock: products.filter(
        (product) => (product.stockStatus ?? "in_stock") === "in_stock",
      ).length,
      outOfStock: products.filter(
        (product) => (product.stockStatus ?? "in_stock") === "out_of_stock",
      ).length,
    };
  }, [products]);

  function resetToFirstPage() {
    setCurrentPage(1);
  }

  async function deleteProduct(product: Product) {
    const confirmed = window.confirm(`Delete "${product.name}" permanently?`);

    if (!confirmed) {
      return;
    }

    setDeletingSlug(product.slug);
    setMessage("");

    try {
      await deleteSupabaseProduct(product.slug);
      setProducts(await fetchSupabaseProducts());
      setMessage("Product deleted successfully.");
    } catch (error) {
      const detail =
        error && typeof error === "object" && "message" in error
          ? String(error.message)
          : "Unknown error";

      setMessage(`Unable to delete product: ${detail}`);
    } finally {
      setDeletingSlug(null);
    }
  }

  return (
    <section className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px]">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-orange-600">
              Catalog
            </p>

            <h1 className="mt-2 text-3xl font-bold text-zinc-950">Products</h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
              Manage product information, pricing, availability and publishing
              status.
            </p>
          </div>

          <Link
            href="/admin/products/new"
            className="inline-flex items-center justify-center rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-orange-600"
          >
            + Add Product
          </Link>
        </div>

        <div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <StatCard label="Total Products" value={stats.total} />
          <StatCard label="Active" value={stats.active} />
          <StatCard label="Draft" value={stats.draft} />
          <StatCard label="In Stock" value={stats.inStock} />
          <StatCard label="Out of Stock" value={stats.outOfStock} />
        </div>

        {message ? (
          <div className="mt-5 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold text-zinc-700">
            {message}
          </div>
        ) : null}

        <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
          <div className="grid gap-3 xl:grid-cols-[minmax(280px,1fr)_220px_180px_190px]">
            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                resetToFirstPage();
              }}
              placeholder="Search name, SKU, brand, keyword..."
              className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-orange-300 focus:bg-white"
            />

            <select
              value={categoryFilter}
              onChange={(event) => {
                setCategoryFilter(event.target.value);
                resetToFirstPage();
              }}
              className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-semibold text-zinc-700 outline-none"
            >
              <option value="all">All categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {formatCategory(category)}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value as StatusFilter);
                resetToFirstPage();
              }}
              className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-semibold text-zinc-700 outline-none"
            >
              <option value="all">All status</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
            </select>

            <select
              value={stockFilter}
              onChange={(event) => {
                setStockFilter(event.target.value as StockFilter);
                resetToFirstPage();
              }}
              className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-semibold text-zinc-700 outline-none"
            >
              <option value="all">All stock</option>
              <option value="in_stock">In Stock</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>
          </div>
        </div>
{isLoadingProducts ? (
  <p className="mt-5 text-sm font-semibold text-zinc-500">
    Loading complete admin catalog...
  </p>
) : null}
        <div className="mt-5 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <div className="hidden grid-cols-[minmax(340px,2fr)_140px_180px_120px_160px_120px] gap-4 border-b border-zinc-200 bg-zinc-50 px-5 py-3 text-xs font-bold uppercase tracking-wider text-zinc-400 xl:grid">
            <div>Product</div>
            <div>SKU</div>
            <div>Category</div>
            <div>Price</div>
            <div>Status</div>
            <div className="text-right">Actions</div>
          </div>

          {visibleProducts.length > 0 ? (
            <div className="divide-y divide-zinc-100">
              {visibleProducts.map((product) => (
                <ProductRow
                  key={product.slug}
                  product={product}
                  deleting={deletingSlug === product.slug}
                  onDelete={() => void deleteProduct(product)}
                />
              ))}
            </div>
          ) : (
            <div className="px-6 py-16 text-center">
              <p className="text-base font-bold text-zinc-800">
                No products found
              </p>
              <p className="mt-1 text-sm text-zinc-500">
                Try changing your search or filters.
              </p>
            </div>
          )}
        </div>

        <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-zinc-500">
            Showing{" "}
            <span className="font-semibold text-zinc-800">
              {filteredProducts.length === 0
                ? 0
                : (safePage - 1) * PRODUCTS_PER_PAGE + 1}
              –{Math.min(safePage * PRODUCTS_PER_PAGE, filteredProducts.length)}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-zinc-800">
              {filteredProducts.length}
            </span>
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              className="rounded-lg border border-zinc-200 px-3 py-2 text-sm font-semibold text-zinc-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>

            <span className="rounded-lg bg-zinc-100 px-3 py-2 text-sm font-bold text-zinc-800">
              {safePage} / {totalPages}
            </span>

            <button
              type="button"
              disabled={safePage >= totalPages}
              onClick={() =>
                setCurrentPage((page) => Math.min(totalPages, page + 1))
              }
              className="rounded-lg border border-zinc-200 px-3 py-2 text-sm font-semibold text-zinc-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProductRow({
  product,
  deleting,
  onDelete,
}: {
  product: Product;
  deleting: boolean;
  onDelete: () => void;
}) {
  return (
    <div className="grid gap-4 px-4 py-4 transition hover:bg-zinc-50 sm:px-5 xl:grid-cols-[minmax(260px,2fr)_110px_150px_100px_145px_110px] xl:items-center">
      <div className="flex min-w-0 items-center gap-4">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="64px"
            className="object-contain p-1"
            referrerPolicy="no-referrer"
          />
        </div>

        <div className="min-w-0">
          <p
            className="line-clamp-2 text-sm font-bold leading-5 text-zinc-950"
            title={product.name}
          >
            {product.name}
          </p>

          <p className="mt-1 truncate text-xs text-zinc-500">
            {product.brand || "No brand"}
          </p>
        </div>
      </div>

      <div className="text-sm font-semibold text-zinc-700">
        <span className="mr-2 text-xs font-bold uppercase text-zinc-400 xl:hidden">
          SKU
        </span>
        {product.sku || "—"}
      </div>

      <div className="text-sm text-zinc-600">
        <span className="mr-2 text-xs font-bold uppercase text-zinc-400 xl:hidden">
          Category
        </span>
        {formatCategory(product.categorySlug)}
      </div>

      <div>
        <p className="text-sm font-bold text-zinc-950">AED {product.price}</p>

        {product.actualPrice && product.actualPrice > product.price ? (
          <p className="text-xs text-zinc-400 line-through">
            AED {product.actualPrice}
          </p>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2">
        <StatusBadge
          label={(product.status ?? "active") === "active" ? "Active" : "Draft"}
          kind={
            (product.status ?? "active") === "active" ? "success" : "warning"
          }
        />

        <StatusBadge
          label={
            (product.stockStatus ?? "in_stock") === "in_stock"
              ? "In Stock"
              : "Out of Stock"
          }
          kind={
            (product.stockStatus ?? "in_stock") === "in_stock"
              ? "neutral"
              : "danger"
          }
        />
      </div>

      <div className="flex justify-start gap-2 xl:justify-end">
        <Link
          href={`/admin/products/${encodeURIComponent(product.slug)}/edit`}
          className="rounded-lg border border-zinc-200 px-3 py-2 text-xs font-bold text-zinc-700 transition hover:border-orange-300 hover:text-orange-600"
        >
          Edit
        </Link>

        <button
          type="button"
          disabled={deleting}
          onClick={onDelete}
          className="rounded-lg border border-zinc-200 px-3 py-2 text-xs font-bold text-zinc-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
        >
          {deleting ? "..." : "Delete"}
        </button>
      </div>
    </div>
  );
}

function StatusBadge({
  label,
  kind,
}: {
  label: string;
  kind: "success" | "warning" | "neutral" | "danger";
}) {
  const styles = {
    success: "bg-emerald-50 text-emerald-700",
    warning: "bg-amber-50 text-amber-700",
    neutral: "bg-blue-50 text-blue-700",
    danger: "bg-red-50 text-red-700",
  };

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${styles[kind]}`}
    >
      {label}
    </span>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white px-5 py-4 shadow-sm">
      <p className="text-xs font-semibold text-zinc-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-zinc-950">{value}</p>
    </div>
  );
}

function formatCategory(value: string) {
  const categoryNames: Record<string, string> = {
    "home-and-kitchen": "Home & Kitchen",
    "electronic-gadgets": "Electronic Gadgets",
    "baby-and-toys": "Baby & Toys",
    automative: "Automotive",
    "health-and-beauty": "Health & Beauty",
    "tools-and-home-improvement": "Tools & Home Improvement",
  };

  return (
    categoryNames[value] ??
    value
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ")
  );
}
