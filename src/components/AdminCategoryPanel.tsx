"use client";

import { useEffect, useMemo, useState } from "react";
import {
  adminCategoriesUpdatedEvent,
  categories as fallbackCategories,
  type Category,
} from "@/lib/categories";
import type { Product } from "@/lib/products";
import { fetchSupabaseCategories } from "@/lib/supabase-categories";
import { fetchSupabaseProducts } from "@/lib/supabase-products";

type StatusFilter = "all" | "active" | "inactive";

export function AdminCategoryPanel() {
  const [items, setItems] = useState<Category[]>(fallbackCategories);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  useEffect(() => {
    let active = true;

    async function loadAdminData() {
      try {
        const [nextCategories, nextProducts] = await Promise.all([
          fetchSupabaseCategories(),
          fetchSupabaseProducts(),
        ]);

        if (active) {
          setItems(nextCategories);
          setProducts(nextProducts);
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void loadAdminData();

    function handleCategoriesUpdated() {
      void loadAdminData();
    }

    window.addEventListener(
      adminCategoriesUpdatedEvent,
      handleCategoriesUpdated,
    );

    return () => {
      active = false;
      window.removeEventListener(
        adminCategoriesUpdatedEvent,
        handleCategoriesUpdated,
      );
    };
  }, []);

  const productCounts = useMemo(() => {
    const counts = new Map<string, number>();

    for (const product of products) {
      counts.set(
        product.categorySlug,
        (counts.get(product.categorySlug) ?? 0) + 1,
      );
    }

    return counts;
  }, [products]);

  const stats = useMemo(() => {
    return {
      total: items.length,
      active: items.filter((category) => category.isActive ?? true).length,
      inactive: items.filter((category) => !(category.isActive ?? true)).length,
    };
  }, [items]);

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();

    return items.filter((category) => {
      const matchesSearch =
        !query ||
        category.name.toLowerCase().includes(query) ||
        category.slug.toLowerCase().includes(query) ||
        category.description.toLowerCase().includes(query);

      const isActive = category.isActive ?? true;

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && isActive) ||
        (statusFilter === "inactive" && !isActive);

      return matchesSearch && matchesStatus;
    });
  }, [items, search, statusFilter]);

  return (
    <section className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px]">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-orange-600">
              Catalog
            </p>

            <h1 className="mt-2 text-3xl font-bold text-zinc-950">
              Categories
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
              Organize your storefront categories, visibility and display order.
            </p>
          </div>

          <a
            href="/admin/categories/new"
            className="inline-flex items-center justify-center rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-orange-600"
          >
            + Add Category
          </a>
        </div>

        <div className="mt-7 grid gap-3 sm:grid-cols-3">
          <StatCard label="Total Categories" value={stats.total} />
          <StatCard label="Active" value={stats.active} />
          <StatCard label="Inactive" value={stats.inactive} />
        </div>

        <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
          <div className="grid gap-3 lg:grid-cols-[minmax(280px,1fr)_220px]">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search category name, slug or description..."
              className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-orange-300 focus:bg-white"
            />

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as StatusFilter)
              }
              className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-semibold text-zinc-700 outline-none"
            >
              <option value="all">All status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <p className="mt-5 text-sm font-semibold text-zinc-500">
            Loading complete category catalog...
          </p>
        ) : null}

        <div className="mt-5 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <div className="hidden grid-cols-[minmax(300px,2fr)_130px_110px_140px_110px] gap-4 border-b border-zinc-200 bg-zinc-50 px-5 py-3 text-xs font-bold uppercase tracking-wider text-zinc-400 lg:grid">
            <div>Category</div>
            <div>Products</div>
            <div>Order</div>
            <div>Status</div>
            <div className="text-right">Actions</div>
          </div>

          {filteredItems.length > 0 ? (
            filteredItems.map((category) => {
              const isActive = category.isActive ?? true;
              const productCount = productCounts.get(category.slug) ?? 0;

              return (
                <div
                  key={category.slug}
                  className="border-b border-zinc-100 px-5 py-4 last:border-b-0"
                >
                  <div className="grid gap-4 lg:grid-cols-[minmax(300px,2fr)_130px_110px_140px_110px] lg:items-center">
                    <div className="min-w-0">
                      <div className="flex items-center gap-3">
                        <CategoryThumbnail category={category} />

                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-zinc-950">
                            {category.name}
                          </p>

                          <p className="mt-1 truncate text-xs text-zinc-400">
                            /{category.slug}
                          </p>

                          {category.description ? (
                            <p className="mt-1 line-clamp-1 text-xs text-zinc-500">
                              {category.description}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </div>

                    <div>
                      <MobileLabel>Products</MobileLabel>
                      <span className="text-sm font-semibold text-zinc-700">
                        {productCount}
                      </span>
                    </div>

                    <div>
                      <MobileLabel>Order</MobileLabel>
                      <span className="inline-flex min-w-8 justify-center rounded-lg bg-zinc-100 px-2.5 py-1.5 text-sm font-bold text-zinc-700">
                        {category.displayOrder ?? 0}
                      </span>
                    </div>

                    <div>
                      <MobileLabel>Status</MobileLabel>

                      <span
                        className={
                          isActive
                            ? "inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700"
                            : "inline-flex rounded-full bg-zinc-100 px-3 py-1 text-xs font-bold text-zinc-500"
                        }
                      >
                        {isActive ? "Active" : "Inactive"}
                      </span>
                    </div>

                    <div className="lg:text-right">
                      <a
                        href={`/admin/categories/${encodeURIComponent(
                          category.slug,
                        )}/edit`}
                        className="inline-flex rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-bold text-zinc-700 transition hover:border-orange-200 hover:text-orange-600"
                      >
                        Edit
                      </a>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="px-5 py-14 text-center">
              <p className="text-sm font-bold text-zinc-700">
                No categories found
              </p>
              <p className="mt-1 text-sm text-zinc-400">
                Try changing your search or status filter.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">
        {label}
      </p>
      <p className="mt-3 text-3xl font-bold text-zinc-950">{value}</p>
    </div>
  );
}

function MobileLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400 lg:hidden">
      {children}
    </p>
  );
}

function CategoryThumbnail({ category }: { category: Category }) {
  if (category.imageUrl) {
    return (
      <div
        className="h-12 w-12 shrink-0 rounded-xl border border-zinc-200 bg-zinc-50 bg-cover bg-center"
        style={{ backgroundImage: `url("${category.imageUrl}")` }}
        aria-label={`${category.name} category image`}
      />
    );
  }

  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-orange-100 bg-orange-50 text-lg font-black text-orange-500">
      {category.name.trim().charAt(0).toUpperCase() || "C"}
    </div>
  );
}
