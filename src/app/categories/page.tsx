import Link from "next/link";
import type { Metadata } from "next";
import { categories } from "@/lib/categories";
import { fetchMergedCategories } from "@/lib/supabase-categories";

export const revalidate = 120;

export const metadata: Metadata = {
  title: "Shop by Category | HM Shop Online",
  description:
    "Browse HM Shop Online by category including home and kitchen, gadgets, baby and toys, automotive, health and beauty, and more.",
};

const categoryIcons: Record<string, string> = {
  "home-and-kitchen": "🏠",
  "electronic-gadgets": "🔌",
  "baby-toys": "🧸",
  automative: "🚗",
  "health-beauty": "✨",
};

export default async function CategoriesPage() {
  const allCategories = await fetchMergedCategories().catch(() => categories);

  return (
    <main className="min-h-screen bg-zinc-50">
      <section className="mx-auto w-full max-w-[1280px] px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-orange-600">
            Browse Departments
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl">
            Shop by Category
          </h1>

          <p className="mt-3 text-base leading-7 text-zinc-600">
            Find what you need faster by choosing a category below.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {allCategories.map((category) => (
            <Link
              key={category.slug}
              href={`/categories/${category.slug}`}
              className="group flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-md"
            >
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-3xl">
                {categoryIcons[category.slug] ?? "🛍️"}
              </div>

              <h2 className="mt-5 break-words text-base font-bold leading-6 text-zinc-950 transition group-hover:text-orange-700 sm:text-lg">
                {category.name}
              </h2>

              <p className="mt-2 line-clamp-3 min-w-0 break-words text-sm leading-6 text-zinc-600">
                {category.description}
              </p>

              <div className="mt-auto pt-5 text-sm font-bold text-orange-700">
                Shop Now →
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-10 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:flex sm:items-center sm:justify-between sm:gap-6">
          <div>
            <h2 className="text-lg font-bold text-zinc-950">
              Want to see everything?
            </h2>

            <p className="mt-1 text-sm leading-6 text-zinc-600">
              Browse our complete product collection in one place.
            </p>
          </div>

          <Link
            href="/products"
            className="mt-4 inline-flex rounded-xl bg-[#fa710c] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#e66000] sm:mt-0"
          >
            View All Products
          </Link>
        </div>
      </section>
    </main>
  );
}
