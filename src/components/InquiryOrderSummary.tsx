"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { type CartItem, getCartItems } from "@/lib/cart";
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
  const [shippingCharge, setShippingCharge] = useState(defaultSiteSettings.shippingCharge);

  useEffect(() => {
    const timer = window.setTimeout(() => setCartItems(getCartItems()), 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(async () => {
      const settings = await fetchSiteSettings().catch(() => defaultSiteSettings);
      setShippingCharge(settings.shippingCharge);
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
            <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-zinc-100">
              <Image
                src={item.product.imageUrl}
                alt={item.product.name}
                fill
                sizes="56px"
                loading="lazy"
                className="object-cover"
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
          <span>AED {shippingCharge}</span>
        </div>
      </div>
      <div className="mt-2 flex justify-between text-lg font-bold text-zinc-950">
        <span>Total</span>
        <span>AED {total}</span>
      </div>
    </div>
  );
}
