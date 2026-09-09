"use client";

import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import {
  fetchSupabaseOrdersByIdentifier,
  type OrderStatus,
  type TrackedOrderRecord,
} from "@/lib/supabase-orders";

const orderSteps: Array<{
  status: Exclude<OrderStatus, "cancelled">;
  label: string;
  description: string;
}> = [
  {
    status: "pending",
    label: "Order Placed",
    description: "We received your order.",
  },
  {
    status: "processing",
    label: "Processing",
    description: "Your order is being prepared.",
  },
  {
    status: "shipped",
    label: "Shipped",
    description: "Your order is on the way.",
  },
  {
    status: "delivered",
    label: "Delivered",
    description: "Your order has been delivered.",
  },
];

const statusLabels: Record<OrderStatus, string> = {
  pending: "Order Placed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

function getProgressIndex(status: OrderStatus) {
  if (status === "cancelled") {
    return -1;
  }

  return orderSteps.findIndex((step) => step.status === status);
}

export default function TrackOrderPage() {
  const searchParams = useSearchParams();
  const orderNumberFromUrl = searchParams.get("order")?.trim() ?? "";

  const [orderNumber, setOrderNumber] = useState(orderNumberFromUrl);
  const [identifier, setIdentifier] = useState("");
  const [order, setOrder] = useState<TrackedOrderRecord | null>(null);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedOrderNumber = orderNumber.trim();
    const normalizedIdentifier = identifier.trim();

    const isValidOrderNumber = /^ORD[-\w]+$/i.test(normalizedOrderNumber);
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedIdentifier);
    const isPhone = /^[+()\-\s\d]{6,}$/.test(normalizedIdentifier);

    if (!isValidOrderNumber) {
      setMessage("Enter a valid order number, for example ORD-HM-0002.");
      return;
    }

    if (!isEmail && !isPhone) {
      setMessage(
        "Enter the email address or mobile number used when placing the order.",
      );
      return;
    }

    setIsLoading(true);
    setMessage("");
    setOrder(null);

    try {
      const matches = await fetchSupabaseOrdersByIdentifier(
        normalizedOrderNumber,
        normalizedIdentifier,
      );

      if (matches.length === 0) {
        setMessage(
          "We couldn't find an order matching those details. Please check the order number and email or mobile number and try again.",
        );
      } else {
        setOrder(matches[0]);
      }
    } catch {
      setMessage(
        "Unable to track your order right now. Please verify the details and try again.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  const progressIndex = order ? getProgressIndex(order.status) : -1;

  const totalItems =
    order?.items.reduce((total, item) => total + item.quantity, 0) ?? 0;

  return (
    <section className="page-shell">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-orange-600">
            Order Tracking
          </p>

          <h1 className="mt-2 text-3xl font-bold text-zinc-950 sm:text-4xl">
            Track Your Order
          </h1>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-zinc-600">
            Enter your order number together with the email address or mobile
            number used when placing your HM Shop Online order.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mx-auto mt-8 max-w-2xl rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6"
        >
          <div className="grid gap-4">
            <label className="light-form-field">
              Order Number
              <input
                type="text"
                value={orderNumber}
                onChange={(event) => setOrderNumber(event.target.value)}
                placeholder="ORD-HM-0002"
                autoComplete="off"
                required
              />
            </label>

            <label className="light-form-field">
              Email Address or Mobile Number
              <input
                type="text"
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
                placeholder="you@example.com or +971..."
                autoComplete="off"
                required
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-4 flex w-full items-center justify-center rounded-xl bg-[#fa710c] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[#e66000] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Checking Order..." : "Track Order"}
          </button>

          <p className="mt-3 text-center text-xs leading-5 text-zinc-500">
            For your privacy, both details must match the same order.
          </p>
        </form>

        {message ? (
          <div className="mx-auto mt-5 max-w-2xl rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-center text-sm text-zinc-700">
            {message}
          </div>
        ) : null}

        {order ? (
          <div className="mt-8 space-y-6">
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-500">
                    Order Number
                  </p>

                  <h2 className="mt-1 text-2xl font-bold text-zinc-950">
                    {order.orderNumber}
                  </h2>

                  <p className="mt-2 text-sm text-zinc-500">
                    Placed on{" "}
                    {new Date(order.createdAt).toLocaleDateString("en-AE", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>

                <div
                  className={`inline-flex w-fit rounded-full px-3 py-1.5 text-xs font-bold ${
                    order.status === "cancelled"
                      ? "bg-red-50 text-red-700"
                      : order.status === "delivered"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-orange-50 text-orange-700"
                  }`}
                >
                  {statusLabels[order.status]}
                </div>
              </div>

              {order.status === "cancelled" ? (
                <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4">
                  <p className="font-bold text-red-800">
                    This order has been cancelled
                  </p>

                  <p className="mt-1 text-sm leading-5 text-red-700">
                    Please contact us if you need help with this order.
                  </p>
                </div>
              ) : (
                <div className="mt-8">
                  <div className="hidden sm:block">
                    <div className="relative">
                      <div className="absolute left-[12.5%] right-[12.5%] top-5 h-1 bg-zinc-200" />

                      <div
                        className="absolute left-[12.5%] top-5 h-1 bg-[#fa710c] transition-all"
                        style={{
                          width:
                            progressIndex <= 0
                              ? "0%"
                              : progressIndex === 1
                                ? "25%"
                                : progressIndex === 2
                                  ? "50%"
                                  : "75%",
                        }}
                      />

                      <div className="relative grid grid-cols-4 gap-2">
                        {orderSteps.map((step, index) => {
                          const completed = index <= progressIndex;

                          return (
                            <div
                              key={step.status}
                              className="flex flex-col items-center text-center"
                            >
                              <div
                                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-bold ${
                                  completed
                                    ? "border-[#fa710c] bg-[#fa710c] text-white"
                                    : "border-zinc-300 bg-white text-zinc-400"
                                }`}
                              >
                                {completed ? "✓" : index + 1}
                              </div>

                              <p
                                className={`mt-3 text-sm font-bold ${
                                  completed ? "text-zinc-950" : "text-zinc-500"
                                }`}
                              >
                                {step.label}
                              </p>

                              <p className="mt-1 max-w-[130px] text-xs leading-4 text-zinc-500">
                                {step.description}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 sm:hidden">
                    {orderSteps.map((step, index) => {
                      const completed = index <= progressIndex;

                      return (
                        <div
                          key={step.status}
                          className="flex items-start gap-3"
                        >
                          <div
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold ${
                              completed
                                ? "border-[#fa710c] bg-[#fa710c] text-white"
                                : "border-zinc-300 bg-white text-zinc-400"
                            }`}
                          >
                            {completed ? "✓" : index + 1}
                          </div>

                          <div>
                            <p
                              className={`text-sm font-bold ${
                                completed ? "text-zinc-950" : "text-zinc-500"
                              }`}
                            >
                              {step.label}
                            </p>

                            <p className="mt-1 text-xs leading-5 text-zinc-500">
                              {step.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
              <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex items-center justify-between gap-4">
                  <h2 className="text-lg font-bold text-zinc-950">
                    Order Items
                  </h2>

                  <p className="text-sm font-semibold text-zinc-500">
                    {totalItems} item{totalItems === 1 ? "" : "s"}
                  </p>
                </div>

                <div className="mt-5 divide-y divide-zinc-200">
                  {order.items.map((item) => (
                    <div
                      key={item.product.slug}
                      className="flex gap-4 py-4 first:pt-0 last:pb-0"
                    >
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-zinc-100">
                        <Image
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 text-sm font-bold text-zinc-950">
                          {item.product.name}
                        </p>

                        <p className="mt-1 text-xs text-zinc-500">
                          Qty: {item.quantity} × AED {item.product.price}
                        </p>
                      </div>

                      <p className="shrink-0 text-sm font-bold text-zinc-950">
                        AED {item.product.price * item.quantity}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <aside className="h-fit rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
                <h2 className="text-lg font-bold text-zinc-950">
                  Order Summary
                </h2>

                <div className="mt-5 space-y-3 text-sm">
                  <div className="flex justify-between gap-4 text-zinc-600">
                    <span>Shipping</span>
                    <span className="text-right font-semibold text-zinc-900">
                      {order.shippingMethod}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4 text-zinc-600">
                    <span>Payment</span>
                    <span className="font-semibold text-zinc-900">
                      Cash on Delivery
                    </span>
                  </div>
                </div>

                <div className="mt-5 border-t border-zinc-200 pt-5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-zinc-950">Order Total</span>

                    <span className="text-xl font-bold text-zinc-950">
                      AED {order.total}
                    </span>
                  </div>
                </div>

                <div className="mt-5 rounded-xl bg-zinc-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">
                    Need Help?
                  </p>

                  <p className="mt-2 text-sm leading-5 text-zinc-600">
                    Contact HM Shop Online if you have any questions about your
                    delivery.
                  </p>
                </div>
              </aside>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
