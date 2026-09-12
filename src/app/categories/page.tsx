import Link from "next/link";
import type { Metadata } from "next";
import { CategoryVisual } from "@/components/CategoryVisual";
import { categories } from "@/lib/categories";
import { fetchMergedCategories } from "@/lib/supabase-categories";

export const revalidate = 120;

export const metadata: Metadata = {
  title: "Shop by Category | HM Shop Online",
  description:
    "Browse HM Shop Online by category including home and kitchen, gadgets, baby and toys, automotive, health and beauty, and more.",
};

export default async function CategoriesPage() {
  const allCategories = await fetchMergedCategories().catch(() => categories);

  return (
    <main className="min-h-screen bg-zinc-50">
      <section className="mx-auto w-full max-w-[1280px] px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-hm-orange">
            Browse Departments
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl">
            Shop by Category
          </h1>

          <p className="mt-3 text-base leading-7 text-zinc-600">
            Explore our collections and find useful products for every part of
            your day.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {allCategories.map((category) => (
            <Link
              key={category.slug}
              href={`/categories/${category.slug}`}
              className="group flex h-full min-w-0 flex-col overflow-hidden rounded-3xl border border-zinc-200/80 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-orange-200 hover:shadow-xl"
            >
              <CategoryVisual
                slug={category.slug}
                className="aspect-[2/1] w-full"
              />

              <div className="flex flex-1 flex-col p-4 sm:p-5">
                <h2 className="break-words text-lg font-bold leading-6 text-zinc-950 transition group-hover:text-hm-orange">
                  {category.name}
                </h2>

                <p className="mt-2 line-clamp-3 min-w-0 break-words text-sm leading-5 text-zinc-600">
                  {category.description}
                </p>

                <div className="mt-auto pt-4">
                  <span className="inline-flex items-center gap-1.5 text-sm font-bold text-hm-orange">
                    Shop Now
                    <span
                      aria-hidden="true"
                      className="transition-transform duration-200 group-hover:translate-x-1"
                    >
                      →
                    </span>
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-10 overflow-hidden rounded-3xl border border-orange-100 bg-gradient-to-r from-orange-50 via-white to-amber-50 p-6 shadow-sm sm:flex sm:items-center sm:justify-between sm:gap-8 sm:p-7">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-hm-orange">
              Everything in one place
            </p>

            <h2 className="mt-2 text-xl font-bold text-zinc-950">
              Want to browse the complete collection?
            </h2>

            <p className="mt-2 text-sm leading-6 text-zinc-600">
              See all available HM Shop Online products and discover something
              useful.
            </p>
          </div>

          <Link
            href="/products"
            className="mt-5 inline-flex shrink-0 items-center justify-center rounded-xl bg-hm-orange px-6 py-3 text-sm font-bold text-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-hm-orange-hover hover:shadow-md sm:mt-0"
          >
            View All Products
          </Link>
        </div>
      </section>
    </main>
  );
}
