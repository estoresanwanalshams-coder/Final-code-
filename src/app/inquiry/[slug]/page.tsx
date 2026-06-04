import { notFound } from "next/navigation";
import { CheckoutForm } from "@/components/CheckoutForm";
import { InquiryOrderSummary } from "@/components/InquiryOrderSummary";
import { fetchSupabaseProductBySlug } from "@/lib/supabase-products";

type InquiryPageProps = {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    qty?: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function InquiryPage({ params, searchParams }: InquiryPageProps) {
  const { slug } = await params;
  const { qty } = await searchParams;
  const initialQuantity = Math.max(1, Number(qty ?? "1") || 1);
  const product = await fetchSupabaseProductBySlug(slug).catch(() => null);

  if (!product) {
    notFound();
  }

  return (
    <section className="checkout-shell">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="content-reveal checkout-card">
          <div className="grid gap-0 lg:grid-cols-[0.9fr_1.1fr]">
            <aside className="checkout-summary-panel p-6 sm:p-8 lg:p-10">
              <p className="text-sm font-semibold uppercase tracking-wider text-[#FF6B00]">
                Buy Now
              </p>
              <h1 className="mt-3 text-3xl font-bold text-zinc-950 sm:text-4xl">
                Complete your order
              </h1>
              <p className="mt-3 text-sm leading-7 text-zinc-600">
                Review your items and enter delivery details below.
              </p>
              <InquiryOrderSummary fallbackProduct={product} initialQuantity={initialQuantity} />
            </aside>

            <CheckoutForm fallbackProduct={product} initialQuantity={initialQuantity} />
          </div>
        </div>
      </div>
    </section>
  );
}
