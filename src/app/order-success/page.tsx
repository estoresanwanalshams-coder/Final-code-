"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("order") ?? "";

  const trackOrderHref = orderNumber
    ? `/track-order?order=${encodeURIComponent(orderNumber)}`
    : "/track-order";

  return (
    <section className="page-shell">
      <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
          <div className="px-5 py-8 text-center sm:px-8 sm:py-10">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-8 w-8"
                aria-hidden="true"
              >
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </div>

            <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-emerald-600">
              Order Confirmed
            </p>

            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-zinc-950 sm:text-4xl">
              Thank you for your order
            </h1>

            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-zinc-600 sm:text-base">
              Your order has been successfully placed with HM Shop Online.
              We&apos;ll now prepare it for delivery.
            </p>

            {orderNumber ? (
              <div className="mx-auto mt-7 max-w-md rounded-2xl border border-orange-100 bg-orange-50/60 px-5 py-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Your Order Number
                </p>

                <p className="mt-1 break-all text-xl font-extrabold text-zinc-950 sm:text-2xl">
                  {orderNumber}
                </p>

                <p className="mt-2 text-xs leading-5 text-zinc-600">
                  Keep this number handy for tracking or contacting support.
                </p>
              </div>
            ) : null}
          </div>

          <div className="border-t border-zinc-200 bg-zinc-50/70 px-5 py-6 sm:px-8">
            <div className="grid gap-4 sm:grid-cols-3">
              <InfoItem
                icon={
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-5 w-5"
                    aria-hidden="true"
                  >
                    <rect x="3" y="6" width="18" height="12" rx="2" />
                    <path d="M7 10h4" />
                    <circle cx="17" cy="12" r="2" />
                  </svg>
                }
                title="Cash on Delivery"
                description="Pay when your order arrives."
              />

              <InfoItem
                icon={
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-5 w-5"
                    aria-hidden="true"
                  >
                    <path d="M3 7h11v9H3z" />
                    <path d="M14 10h4l3 3v3h-7z" />
                    <circle cx="7" cy="18" r="2" />
                    <circle cx="18" cy="18" r="2" />
                  </svg>
                }
                title="UAE Delivery"
                description="We'll prepare your order for delivery."
              />

              <InfoItem
                icon={
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-5 w-5"
                    aria-hidden="true"
                  >
                    <path d="M4 11a8 8 0 1 0 2-5" />
                    <path d="M4 4v7h7" />
                  </svg>
                }
                title="Track Your Order"
                description="Check your latest order status anytime."
              />
            </div>
          </div>

          <div className="border-t border-zinc-200 px-5 py-7 sm:px-8">
            <h2 className="text-lg font-bold text-zinc-950">
              What happens next?
            </h2>

            <div className="mt-5 space-y-5">
              <NextStep
                number="1"
                title="We review your order"
                description="Your order details are received and prepared for processing."
              />

              <NextStep
                number="2"
                title="Your order is prepared"
                description="We'll prepare your items and arrange delivery to your UAE address."
              />

              <NextStep
                number="3"
                title="Pay on delivery"
                description="Your order is Cash on Delivery, so no online payment is required."
              />
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <Link
                href={trackOrderHref}
                className="inline-flex min-h-12 items-center justify-center rounded-xl bg-[#fa710c] px-5 py-3 text-sm font-bold text-white transition hover:bg-orange-700 active:scale-[0.99]"
              >
                Track Order
              </Link>

              <Link
                href="/products"
                className="inline-flex min-h-12 items-center justify-center rounded-xl border border-zinc-300 bg-white px-5 py-3 text-sm font-bold text-zinc-900 transition hover:border-zinc-400 hover:bg-zinc-50 active:scale-[0.99]"
              >
                Continue Shopping
              </Link>
            </div>

            <div className="mt-6 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-center">
              <p className="text-sm font-semibold text-zinc-900">
                Need help with your order?
              </p>

              <a
                href={
                  orderNumber
                    ? `https://wa.me/971562300750?text=${encodeURIComponent(
                        `Hello HM Shop Online, I need help with order ${orderNumber}.`,
                      )}`
                    : "https://wa.me/971562300750"
                }
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex items-center gap-2 text-sm font-bold text-emerald-700 transition hover:text-emerald-800"
              >
                Contact us on WhatsApp
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="h-4 w-4"
                  aria-hidden="true"
                >
                  <path
                    d="M5 12h14M13 6l6 6-6 6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>
            </div>

            <p className="mt-5 text-center text-xs leading-5 text-zinc-500">
              Please keep your order number until your order has been delivered.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function InfoItem({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-3 rounded-2xl bg-white p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-[#fa710c]">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-sm font-bold text-zinc-950">{title}</p>
        <p className="mt-1 text-xs leading-5 text-zinc-600">{description}</p>
      </div>
    </div>
  );
}

function NextStep({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-50 text-sm font-extrabold text-[#fa710c]">
        {number}
      </div>

      <div className="min-w-0 pt-0.5">
        <p className="text-sm font-bold text-zinc-950">{title}</p>
        <p className="mt-1 text-sm leading-6 text-zinc-600">{description}</p>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<section className="page-shell min-h-[70vh]" />}>
      <OrderSuccessContent />
    </Suspense>
  );
}
