import Link from "next/link";
import { categories, type Category } from "@/lib/categories";

type ProductCategoryNavProps = {
  activeSlug?: string;
  categoryList?: Category[];
};

export function ProductCategoryNav({
  activeSlug,
  categoryList = categories,
}: ProductCategoryNavProps) {
  return (
    <nav aria-label="Shop by category" className="mb-7">
      <div className="mb-3 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-orange-600">
            Browse
          </p>
          <h2 className="mt-1 text-lg font-bold text-zinc-950">
            Shop by Category
          </h2>
        </div>
      </div>

      <div className="-mx-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
        <div className="flex min-w-max gap-2">
          <Link
            href="/products"
            className={`rounded-full border px-4 py-2.5 text-sm font-bold transition ${
              !activeSlug
                ? "border-hm-orange bg-hm-orange text-white"
                : "border-zinc-200 bg-white text-zinc-700 hover:border-hm-orange hover:text-hm-orange"
            }`}
          >
            All Products
          </Link>

          {categoryList.map((category) => {
            const isActive = category.slug === activeSlug;

            return (
              <Link
                key={category.slug}
                href={`/categories/${category.slug}`}
                className={`rounded-full border px-4 py-2.5 text-sm font-bold transition ${
                  isActive
                    ? "border-hm-orange bg-hm-orange text-white"
                    : "border-zinc-200 bg-white text-zinc-700 hover:border-hm-orange hover:text-hm-orange"
                }`}
              >
                {category.name}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}