import Link from "next/link";
import { CategoryVisual } from "@/components/CategoryVisual";

type HomeCategory = {
  name: string;
  slug: string;
};

type HomeCategoryGridProps = {
  categories: HomeCategory[];
};

export function HomeCategoryGrid({ categories }: HomeCategoryGridProps) {
  if (categories.length === 0) {
    return null;
  }

  return (
    <section className="mt-10 sm:mt-12">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-hm-orange">
            Explore HM
          </p>

          <h2 className="mt-1 text-2xl font-bold tracking-tight text-zinc-950 sm:text-3xl">
            Shop by Category
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
            Discover useful products for home, family, lifestyle and everyday
            needs.
          </p>
        </div>

        <Link
          href="/categories"
          className="hidden items-center gap-1 text-sm font-bold text-hm-orange transition hover:text-hm-orange sm:inline-flex"
        >
          View All
          <span aria-hidden="true">→</span>
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {categories.slice(0, 6).map((category) => (
          <Link
            key={category.slug}
            href={`/categories/${category.slug}`}
            className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-orange-200 hover:shadow-lg"
          >
            <CategoryVisual
              slug={category.slug}
              className="aspect-[4/3] w-full"
            />

            <div className="flex flex-1 flex-col px-3.5 py-3.5 sm:px-4">
              <h3 className="line-clamp-2 text-sm font-bold leading-5 text-zinc-950 transition group-hover:text-hm-orange">
                {category.name}
              </h3>

              <span className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-hm-orange">
                Shop now
                <span
                  aria-hidden="true"
                  className="transition-transform duration-200 group-hover:translate-x-0.5"
                >
                  →
                </span>
              </span>
            </div>
          </Link>
        ))}
      </div>

      <Link
        href="/categories"
        className="mt-5 inline-flex items-center gap-1 text-sm font-bold text-hm-orange sm:hidden"
      >
        View All Categories
        <span aria-hidden="true">→</span>
      </Link>
    </section>
  );
}