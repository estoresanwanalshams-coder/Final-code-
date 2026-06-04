"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

function OrderSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("order") ?? "";

  useEffect(() => {
    const timer = window.setTimeout(() => {
      router.push("/");
    }, 5000);

    return () => window.clearTimeout(timer);
  }, [router]);

  return (
    <section className="page-shell">
      <div className="mx-auto flex min-h-[70vh] max-w-lg items-center px-4 py-16 text-center">
        <div className="w-full rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wider text-emerald-600">
            Success
          </p>
          <h1 className="mt-3 text-3xl font-bold text-zinc-950">
            Order placed successfully
          </h1>
          {orderNumber ? (
            <p className="mt-4 text-sm text-zinc-600">
              Your order number is{" "}
              <span className="font-bold text-zinc-950">{orderNumber}</span>
            </p>
          ) : null}
          <p className="mt-3 text-sm text-zinc-600">
            Please check your inbox and spam folder for order details.
          </p>
          <p className="mt-2 text-sm text-zinc-600">
            You will be redirected to the home page in a few seconds.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link href="/" className="btn-soft justify-center">
              Go to Home
            </Link>
            <Link href="/track-order" className="btn-soft justify-center">
              Track Order
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<section className="page-shell min-h-[70vh]" />}>
      <OrderSuccessContent />
    </Suspense>
  );
}
