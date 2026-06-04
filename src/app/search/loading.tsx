import { ProductGridSkeleton } from "@/components/ProductGridSkeleton";

export default function LoadingSearchPage() {
  return (
    <section className="page-shell">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <p className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
          Product search
        </p>
        <h1 className="mt-3 text-4xl font-bold text-zinc-950">Search results</h1>
        <div className="mt-8">
          <ProductGridSkeleton count={8} />
        </div>
      </div>
    </section>
  );
}
