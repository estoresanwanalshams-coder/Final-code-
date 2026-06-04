import { ProductGridSkeleton } from "@/components/ProductGridSkeleton";

export default function LoadingHomePage() {
  return (
    <section className="page-shell">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="banner-carousel content-reveal animate-pulse bg-zinc-200" />
        <div className="mt-14">
          <ProductGridSkeleton count={8} />
        </div>
      </div>
    </section>
  );
}
