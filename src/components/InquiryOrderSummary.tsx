"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import {
  type CartItem,
  getApplicableShippingCharge,
  getCartItems,
} from "@/lib/cart";
import type { Product } from "@/lib/products";
import { defaultSiteSettings, fetchSiteSettings } from "@/lib/site-settings";

type InquiryOrderSummaryProps = {
  fallbackProduct: Product;
  initialQuantity?: number;
};

export function InquiryOrderSummary({
  fallbackProduct,
  initialQuantity = 1,
}: InquiryOrderSummaryProps) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [baseShippingCharge, setBaseShippingCharge] = useState(
    defaultSiteSettings.shippingCharge,
  );

  useEffect(() => {
    const timer = window.setTimeout(() => setCartItems(getCartItems()), 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(async () => {
      const settings = await fetchSiteSettings().catch(
        () => defaultSiteSettings,
      );
      setBaseShippingCharge(settings.shippingCharge);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const items = useMemo(
    () =>
      cartItems.length > 0
        ? cartItems
        : [
            {
              product: fallbackProduct,
              quantity: initialQuantity,
            },
          ],
    [cartItems, fallbackProduct, initialQuantity],
  );

  const subtotal = useMemo(
    () =>
      items.reduce(
        (total, item) => total + item.product.price * item.quantity,
        0,
      ),
    [items],
  );
  const shippingCharge = useMemo(
    () => getApplicableShippingCharge(items, baseShippingCharge),
    [items, baseShippingCharge],
  );
  const total = subtotal + shippingCharge;

  return (
    <div className="checkout-order-summary">
      <p className="text-sm font-bold text-zinc-900">Your items</p>
      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li
            key={item.product.slug}
            className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-zinc-50 p-2"
          >
            <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-zinc-100 bg-white">
              <Image
                src={item.product.imageUrl}
                alt={item.product.name}
                fill
                sizes="64px"
                loading="lazy"
                className="object-contain p-1"
              />
            </span>
            <span className="min-w-0 flex-1 text-sm font-semibold text-zinc-900">
              {item.product.name}
              {item.quantity > 1 ? ` × ${item.quantity}` : ""}
            </span>
            <span className="text-sm font-bold text-zinc-700">
              AED {item.product.price * item.quantity}
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-5 space-y-2 border-t border-zinc-200 pt-4 text-sm text-zinc-700">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>AED {subtotal}</span>
        </div>
        <div className="flex justify-between">
          <span>Shipping</span>
          <span>{shippingCharge === 0 ? "Free" : `AED ${shippingCharge}`}</span>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-zinc-100 pt-4 text-zinc-950">
        <span className="font-bold">Total</span>
        <span className="text-2xl font-extrabold tracking-tight">
          AED {total}
        </span>
      </div>
    </div>
  );
}
