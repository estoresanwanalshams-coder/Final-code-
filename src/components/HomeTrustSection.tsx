import { FeatureHighlights } from "@/components/FeatureHighlights";

export function HomeTrustSection() {
  return (
    <section className="home-trust-section mt-8 border-y border-zinc-200 bg-white px-4 py-5 sm:mt-10 sm:px-6">
      <div className="home-trust-section-heading mb-4 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-hm-orange">
          Shop with confidence
        </p>

        <h2 className="mt-1 text-lg font-bold text-zinc-950 sm:text-xl">
          Easy shopping, made for the UAE
        </h2>
      </div>

      <FeatureHighlights compact />
    </section>
  );
}