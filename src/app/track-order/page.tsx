"use client";

import { useState } from "react";
import { fetchSupabaseOrdersByIdentifier, type OrderRecord } from "@/lib/supabase-orders";

export default function TrackOrderPage() {
  const [identifier, setIdentifier] = useState("");
  const [order, setOrder] = useState<OrderRecord | null>(null);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = identifier.trim();
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    const isOrderOrPhone = /^(ORD[-\w]+|[+()\-\s\d]{6,})$/i.test(value);
    if (!isEmail && !isOrderOrPhone) {
      setMessage("Enter a valid email address or order/phone number.");
      return;
    }

    setIsLoading(true);
    setMessage("");
    setOrder(null);

    try {
      const matches = await fetchSupabaseOrdersByIdentifier(identifier);
      if (matches.length === 0) {
        setMessage("No order found for this email or number.");
      } else {
        setOrder(matches[0]);
      }
    } catch {
      setMessage("Unable to track order. Please verify the details and try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="page-shell">
      <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-zinc-950">Track Order</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Enter your email address or order/phone number to check the latest status.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 grid gap-4 rounded-xl border border-zinc-200 bg-white p-5">
          <label className="light-form-field">
            Email or Order/Phone Number
            <input
              type="text"
              value={identifier}
              onChange={(event) => setIdentifier(event.target.value)}
              placeholder="you@example.com or ORD-XXXX or +971..."
              required
            />
          </label>
          <button type="submit" disabled={isLoading} className="btn-soft w-fit px-6 disabled:opacity-70">
            {isLoading ? "Checking..." : "Track"}
          </button>
        </form>

        {message ? (
          <p className="mt-4 rounded-md border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-700">
            {message}
          </p>
        ) : null}

        {order ? (
          <div className="mt-5 rounded-xl border border-zinc-200 bg-white p-5">
            <p className="text-sm text-zinc-500">Order Number</p>
            <p className="text-lg font-bold text-zinc-950">{order.orderNumber}</p>
            <div className="mt-3 grid gap-2 text-sm text-zinc-700">
              <p>Status: <span className="font-semibold uppercase">{order.status}</span></p>
              <p>Total: AED {order.total}</p>
              <p>Shipping Method: {order.shippingMethod}</p>
              <p>Placed On: {new Date(order.createdAt).toLocaleString()}</p>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
