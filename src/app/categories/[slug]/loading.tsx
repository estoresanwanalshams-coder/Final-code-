import { ProductGridSkeleton } from "@/components/ProductGridSkeleton";

export default function LoadingCategoryPage() {
  return (
    <section className="page-shell bg-zinc-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="content-reveal">
          <p className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
            Category
          </p>
          <h1 className="mt-3 h-10 w-64 animate-pulse rounded bg-zinc-200" />
          <div className="mt-8">
            <ProductGridSkeleton count={8} />
          </div>
        </div>
      </div>
    </section>
  );
}
