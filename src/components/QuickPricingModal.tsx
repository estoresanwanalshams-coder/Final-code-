"use client";

import { useEffect, useMemo, useState } from "react";
import type { Product } from "@/lib/products";

type QuickPricingModalProps = {
  product: Product;
  isSaving: boolean;
  onClose: () => void;
  onSave: (pricing: { price: number; actualPrice?: number }) => Promise<void>;
};

export function QuickPricingModal({
  product,
  isSaving,
  onClose,
  onSave,
}: QuickPricingModalProps) {
  const [actualPrice, setActualPrice] = useState(
    product.actualPrice ? String(product.actualPrice) : "",
  );
  const [price, setPrice] = useState(String(product.price));
  const [error, setError] = useState("");

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isSaving) {
        onClose();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isSaving, onClose]);

  const discountPercent = useMemo(() => {
    const nextPrice = Number(price);
    const nextActual = Number(actualPrice);
    if (
      !Number.isFinite(nextPrice) ||
      !Number.isFinite(nextActual) ||
      nextActual <= 0 ||
      nextActual <= nextPrice
    ) {
      return null;
    }

    return Math.round(((nextActual - nextPrice) / nextActual) * 100);
  }, [actualPrice, price]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsedPrice = Number(price);
    const parsedActual = actualPrice.trim() ? Number(actualPrice) : undefined;

    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
      setError("Enter a valid sale price.");
      return;
    }

    if (
      parsedActual !== undefined &&
      (!Number.isFinite(parsedActual) || parsedActual < 0)
    ) {
      setError("Enter a valid regular price.");
      return;
    }

    setError("");
    await onSave({
      price: parsedPrice,
      actualPrice: parsedActual,
    });
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="quick-pricing-title"
      onClick={() => {
        if (!isSaving) {
          onClose();
        }
      }}
    >
      <form
        onSubmit={(event) => void handleSubmit(event)}
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <p className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
          Quick pricing
        </p>
        <h2
          id="quick-pricing-title"
          className="mt-2 text-xl font-bold text-zinc-950"
        >
          {product.name}
        </h2>

        <div className="mt-6 grid gap-4">
          <label className="block text-sm font-semibold text-zinc-800">
            Regular price (AED)
            <input
              type="number"
              min="0"
              step="0.01"
              value={actualPrice}
              onChange={(event) => setActualPrice(event.target.value)}
              placeholder="Optional original price"
              className="mt-1.5 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-950"
            />
          </label>

          <label className="block text-sm font-semibold text-zinc-800">
            Sale price (AED)
            <input
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              required
              className="mt-1.5 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-950"
            />
          </label>

          <div className="rounded-xl bg-zinc-50 px-4 py-3 text-sm text-zinc-700">
            Discount:{" "}
            <span className="font-bold text-zinc-950">
              {discountPercent !== null ? `${discountPercent}% off` : "—"}
            </span>
          </div>

          {error ? (
            <p className="text-sm font-semibold text-red-600">{error}</p>
          ) : null}
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="flex-1 rounded-md border border-zinc-300 px-4 py-2.5 text-sm font-bold text-zinc-900 transition hover:border-zinc-900 disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="flex-1 rounded-md bg-zinc-950 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-zinc-700 disabled:opacity-60"
          >
            {isSaving ? "Saving..." : "Save price"}
          </button>
        </div>
      </form>
    </div>
  );
}
