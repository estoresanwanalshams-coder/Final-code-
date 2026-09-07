import { FeatureHighlights } from "@/components/FeatureHighlights";

export function HomeTrustSection() {
  return (
    <section className="mt-8 border-y border-zinc-200 bg-white px-4 py-5 sm:mt-10 sm:px-6">
      <div className="mb-4 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-600">
          Why shop with HM?
        </p>

        <h2 className="mt-1 text-lg font-bold text-zinc-950 sm:text-xl">
          Convenient shopping built for the UAE
        </h2>
      </div>

      <FeatureHighlights compact />
    </section>
  );
}