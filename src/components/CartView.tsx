"use client";

import { SafeProductImage } from "@/components/SafeProductImage";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  type CartItem,
  getApplicableShippingCharge,
  getCartItems,
  saveCartItems,
} from "@/lib/cart";
import { defaultSiteSettings, fetchSiteSettings } from "@/lib/site-settings";

export function CartView() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [baseShippingCharge, setBaseShippingCharge] = useState(
    defaultSiteSettings.shippingCharge,
  );

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
      const settings = await fetchSiteSettings().catch(
        () => defaultSiteSettings,
      );
      setBaseShippingCharge(settings.shippingCharge);
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
  const shippingCharge = useMemo(
    () => getApplicableShippingCharge(items, baseShippingCharge),
    [items, baseShippingCharge],
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
        item.product.slug === slug ? { ...item, quantity: nextQuantity } : item,
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
              Add products from categories, new arrivals, best sellers, or
              product detail pages.
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
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
        <div className="content-reveal">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-hm-orange">
            Your cart
          </p>
          <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="text-3xl font-bold text-zinc-950 sm:text-4xl">
                Shopping Cart
              </h1>
              <p className="mt-2 text-sm text-zinc-600">
                Review your items before checkout.
              </p>
            </div>

            <p className="text-sm font-semibold text-zinc-600">
              {items.reduce((total, item) => total + item.quantity, 0)} item
              {items.reduce((total, item) => total + item.quantity, 0) === 1
                ? ""
                : "s"}
            </p>
          </div>
        </div>

        <div className="mt-6 grid items-start gap-6 sm:mt-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-8">
          <div className="content-reveal space-y-4">
            {items.map((item) => (
              <article
                key={item.product.slug}
                className="rounded-[20px] border border-zinc-200 bg-white p-3 shadow-sm transition hover:border-zinc-300 sm:p-5"
              >
                <div className="flex gap-4">
                  <Link
                    href={`/products/${item.product.slug}`}
                    className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-zinc-100 bg-zinc-50 sm:h-28 sm:w-28"
                  >
                    <SafeProductImage
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      fill
                      sizes="112px"
                      loading="lazy"
                      className="object-contain p-1"
                    />
                  </Link>

                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/products/${item.product.slug}`}
                      className="line-clamp-2 text-base font-bold leading-6 text-zinc-950 transition hover:text-hm-orange sm:text-lg"
                    >
                      {item.product.name}
                    </Link>

                    <p className="mt-2 text-sm font-semibold text-zinc-600">
                      AED {item.product.price} each
                    </p>

                    {item.product.freeShipping ? (
                      <p className="mt-2 inline-flex rounded-md bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700">
                        Free Shipping
                      </p>
                    ) : null}

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                      <div className="inline-flex items-center overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50 shadow-sm">
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.product.slug, item.quantity - 1)
                          }
                          className="flex h-10 w-10 items-center justify-center text-lg font-bold text-zinc-700 transition hover:bg-zinc-100"
                          aria-label={`Decrease quantity for ${item.product.name}`}
                        >
                          −
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
                          inputMode="numeric"
                          className="h-10 w-12 border-x border-zinc-200 bg-white text-center text-sm font-bold text-zinc-950 outline-none"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.product.slug, item.quantity + 1)
                          }
                          className="flex h-10 w-10 items-center justify-center text-lg font-bold text-zinc-700 transition hover:bg-zinc-100"
                          aria-label={`Increase quantity for ${item.product.name}`}
                        >
                          +
                        </button>
                      </div>

                      <p className="text-lg font-bold text-zinc-950">
                        AED {item.product.price * item.quantity}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeItem(item.product.slug)}
                      className="mt-3 inline-flex text-xs font-bold text-zinc-500 underline decoration-zinc-300 underline-offset-4 transition hover:text-red-600"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <aside className="content-reveal h-fit rounded-[24px] border border-zinc-200 bg-white p-5 shadow-sm sm:p-6 lg:sticky lg:top-28">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-hm-orange">
                Your order
              </p>
              <h2 className="mt-1 text-xl font-bold tracking-tight text-zinc-950">
                Order Summary
              </h2>
            </div>

            <div className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between text-zinc-600">
                <span>
                  Items (
                  {items.reduce((total, item) => total + item.quantity, 0)})
                </span>
                <span className="font-semibold text-zinc-900">
                  AED {subtotal}
                </span>
              </div>

              <div className="flex justify-between text-zinc-600">
                <span>Shipping</span>
                <span className="font-semibold text-zinc-900">
                  {shippingCharge === 0 && items.length > 0
                    ? "Free"
                    : `AED ${shippingCharge}`}
                </span>
              </div>
            </div>

            <div className="mt-5 border-y border-zinc-100 py-5">
              <div className="flex items-center justify-between">
                <span className="text-base font-bold text-zinc-950">Total</span>
                <span className="text-2xl font-extrabold tracking-tight text-zinc-950">
                  AED {grandTotal}
                </span>
              </div>
            </div>
            <div className="mt-5 rounded-xl border border-orange-100 bg-orange-50/60 p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-hm-orange shadow-sm">
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
                </div>

                <div>
                  <p className="text-sm font-bold text-zinc-950">
                    Cash on Delivery
                  </p>

                  <p className="mt-1 text-xs leading-5 text-zinc-600">
                    No online payment required. Place your order now and pay
                    when it arrives.
                  </p>
                </div>
              </div>
            </div>
            <Link
              href={`/inquiry/${items[0]?.product.slug ?? ""}`}
              className="mt-5 flex min-h-13 w-full items-center justify-center rounded-xl bg-hm-orange px-5 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-hm-orange-hover active:scale-[0.99]"
            >
              Proceed to Checkout
              <span className="mx-2 text-orange-200" aria-hidden="true">
                |
              </span>
              AED {grandTotal}
            </Link>

            <Link
              href="/categories"
              className="mt-3 flex w-full items-center justify-center rounded-xl border border-zinc-300 px-5 py-3 text-sm font-bold text-zinc-900 transition hover:bg-zinc-50"
            >
              Continue Shopping
            </Link>

            <p className="mt-4 text-center text-xs leading-5 text-zinc-500">
              UAE delivery | Cash on Delivery | Easy returns
            </p>
          </aside>
        </div>
      </div>
    </section>
  );
}
