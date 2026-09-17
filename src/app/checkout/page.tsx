import { Suspense } from "react";
import { CheckoutForm } from "@/components/CheckoutForm";
import { InquiryOrderSummary } from "@/components/InquiryOrderSummary";

export const dynamic = "force-dynamic";

export default function CheckoutPage() {
  return (
    <section className="checkout-shell">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        <div className="content-reveal checkout-card">
          <div className="grid items-start gap-0 lg:grid-cols-[0.85fr_1.15fr]">
            <aside className="checkout-summary-panel p-6 sm:p-8 lg:p-10">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-hm-orange">
                Secure Checkout
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl">
                Complete your order
              </h1>
              <p className="mt-3 text-sm leading-7 text-zinc-600">
                Review your items and enter delivery details below.
              </p>
              <InquiryOrderSummary />
            </aside>

            <Suspense
              fallback={
                <div className="checkout-form-panel p-8">
                  Loading checkout...
                </div>
              }
            >
              <CheckoutForm />
            </Suspense>
          </div>
        </div>
      </div>
    </section>
  );
}
