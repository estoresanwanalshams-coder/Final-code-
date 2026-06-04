"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { type CartItem, getCartItems, saveCartItems } from "@/lib/cart";
import { defaultSiteSettings, fetchSiteSettings } from "@/lib/site-settings";

export function CartView() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [shippingCharge, setShippingCharge] = useState(defaultSiteSettings.shippingCharge);

  useEffect(() => {
    function loadCart() {
      setItems(getCartItems());
    }

    const timer = window.setTimeout(loadCart, 0);
    window.addEventListener("cart:updated", loadCart);
    window.addEventListener("storage", loadCart);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("cart:updated", loadCart);
      window.removeEventListener("storage", loadCart);
    };
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(async () => {
      const settings = await fetchSiteSettings().catch(() => defaultSiteSettings);
      setShippingCharge(settings.shippingCharge);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const subtotal = useMemo(
    () =>
      items.reduce(
        (total, item) => total + item.product.price * item.quantity,
        0,
      ),
    [items],
  );
  const grandTotal = subtotal + shippingCharge;

  function updateItems(nextItems: CartItem[]) {
    setItems(nextItems);
    saveCartItems(nextItems);
  }

  function updateQuantity(slug: string, quantity: number) {
    const nextQuantity = Math.max(1, quantity);
    updateItems(
      items.map((item) =>
        item.product.slug === slug
          ? { ...item, quantity: nextQuantity }
          : item,
      ),
    );
  }

  function removeItem(slug: string) {
    updateItems(items.filter((item) => item.product.slug !== slug));
  }

  if (items.length === 0) {
    return (
      <section className="page-shell">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="content-reveal rounded-2xl border border-zinc-200 bg-white p-10 text-center shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
              Cart
            </p>
            <h1 className="mt-3 text-4xl font-bold text-zinc-950">
              Your cart is empty
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-zinc-600">
              Add products from categories, new arrivals, best sellers, or product
              detail pages.
            </p>
            <Link
              href="/categories"
              className="animated-button mt-8 inline-flex bg-zinc-950 px-6 py-3 text-sm font-bold text-white transition hover:bg-zinc-700"
            >
              Browse Products
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="page-shell">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_360px] lg:px-8">
        <div className="content-reveal">
          <p className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
            Cart
          </p>
          <h1 className="mt-3 text-4xl font-bold text-zinc-950">Shopping cart</h1>

          <div className="mt-8 space-y-4">
            {items.map((item) => (
              <article
                key={item.product.slug}
                className="cart-row rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm"
              >
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-zinc-100">
                  <Image
                    src={item.product.imageUrl}
                    alt={item.product.name}
                    fill
                    sizes="80px"
                    loading="lazy"
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg font-bold text-zinc-950">
                    {item.product.name}
                  </h2>
                  <button
                    type="button"
                    onClick={() => removeItem(item.product.slug)}
                    className="mt-3 text-sm font-bold text-red-600 transition hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>

                <div className="flex flex-col items-end gap-4">
                  <div className="quantity-control">
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(item.product.slug, item.quantity - 1)
                      }
                    >
                      -
                    </button>
                    <input
                      value={item.quantity}
                      onChange={(event) =>
                        updateQuantity(
                          item.product.slug,
                          Number(event.target.value) || 1,
                        )
                      }
                      aria-label={`Quantity for ${item.product.name}`}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(item.product.slug, item.quantity + 1)
                      }
                    >
                      +
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        <aside className="content-reveal h-fit rounded-2xl bg-zinc-950 p-6 text-white shadow-xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
            Order summary
          </p>
          <div className="mt-6 space-y-4 text-sm">
            <div className="flex justify-between text-zinc-300">
              <span>Items</span>
              <span>{items.reduce((total, item) => total + item.quantity, 0)}</span>
            </div>
            <div className="flex justify-between text-zinc-300">
              <span>Subtotal</span>
              <span>AED {subtotal}</span>
            </div>
            <div className="flex justify-between text-zinc-300">
              <span>Shipping</span>
              <span>AED {shippingCharge}</span>
            </div>
            <div className="border-t border-white/10 pt-4">
              <div className="flex justify-between text-xl font-bold">
                <span>Total</span>
                <span>AED {grandTotal}</span>
              </div>
            </div>
          </div>
          <Link
            href={`/inquiry/${items[0]?.product.slug ?? ""}`}
            className="animated-button mt-7 flex bg-white px-6 py-3 text-center text-sm font-bold text-zinc-950 transition hover:bg-zinc-200"
          >
            Checkout
          </Link>
          <Link
            href="/categories"
            className="mt-3 flex justify-center border border-white/20 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10"
          >
            Continue Shopping
          </Link>
        </aside>
      </div>
    </section>
  );
}
