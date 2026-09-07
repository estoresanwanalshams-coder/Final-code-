import Link from "next/link";

type HomeCategory = {
  name: string;
  slug: string;
};

type HomeCategoryGridProps = {
  categories: HomeCategory[];
};

const categoryIcons: Record<string, string> = {
  "home-and-kitchen": "🏠",
  "electronic-gadgets": "🎧",
  "baby-toys": "🧸",
  automative: "🚗",
  automotive: "🚗",
  "health-beauty": "✨",
  "health-and-beauty": "✨",
  "tools-home-improvement": "🛠️",
  "tools-and-home-improvement": "🛠️",
};

function getCategoryIcon(slug: string) {
  return categoryIcons[slug] ?? "🛍️";
}

export function HomeCategoryGrid({ categories }: HomeCategoryGridProps) {
  if (categories.length === 0) {
    return null;
  }

  return (
    <section className="mt-10 sm:mt-12">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-600">
            Explore HM
          </p>

          <h2 className="mt-1 text-2xl font-bold text-zinc-950 sm:text-3xl">
            Shop by Category
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
            Find useful everyday products across our most popular collections.
          </p>
        </div>

        <Link
          href="/categories"
          className="hidden text-sm font-bold text-orange-600 transition hover:text-orange-700 sm:inline"
        >
          View All →
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {categories.slice(0, 6).map((category) => (
          <Link
            key={category.slug}
            href={`/categories/${category.slug}`}
            className="group rounded-2xl border border-zinc-200 bg-white p-4 text-center shadow-sm transition duration-200 hover:-translate-y-1 hover:border-orange-200 hover:shadow-md sm:p-5"
          >
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-orange-50 text-2xl transition group-hover:bg-orange-100 sm:h-16 sm:w-16 sm:text-3xl">
              {getCategoryIcon(category.slug)}
            </div>

            <h3 className="mt-3 text-sm font-bold leading-5 text-zinc-900">
              {category.name}
            </h3>

            <span className="mt-2 inline-block text-xs font-semibold text-orange-600">
              Shop Now
            </span>
          </Link>
        ))}
      </div>

      <Link
        href="/categories"
        className="mt-4 inline-flex text-sm font-bold text-orange-600 sm:hidden"
      >
        View All Categories →
      </Link>
    </section>
  );
}
