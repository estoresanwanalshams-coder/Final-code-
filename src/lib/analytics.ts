import type { Product } from "@/lib/products";
import type { CartItem } from "@/lib/cart";

type GtagCommand = "event";

type Gtag = (
  command: GtagCommand,
  eventName: string,
  parameters?: Record<string, unknown>,
) => void;

declare global {
  interface Window {
    gtag?: Gtag;
  }
}

function sendEvent(
  eventName: string,
  parameters: Record<string, unknown>,
) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") {
    return;
  }

  window.gtag("event", eventName, parameters);
}

function productToAnalyticsItem(product: Product, quantity = 1) {
  return {
    item_id: product.sku || product.slug,
    item_name: product.name,
    item_category: product.categorySlug,
    price: product.price,
    quantity,
  };
}

export function trackViewItem(product: Product) {
  sendEvent("view_item", {
    currency: "AED",
    value: product.price,
    items: [productToAnalyticsItem(product)],
  });
}

export function trackAddToCart(product: Product, quantity = 1) {
  sendEvent("add_to_cart", {
    currency: "AED",
    value: product.price * quantity,
    items: [productToAnalyticsItem(product, quantity)],
  });
}

export function trackBeginCheckout(items: CartItem[]) {
  const value = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );

  sendEvent("begin_checkout", {
    currency: "AED",
    value,
    items: items.map((item) =>
      productToAnalyticsItem(item.product, item.quantity),
    ),
  });
}

export function trackPurchase(
  orderNumber: string,
  items: CartItem[],
  subtotal: number,
  shipping: number,
  total: number,
) {
  sendEvent("purchase", {
    transaction_id: orderNumber,
    currency: "AED",
    value: total,
    shipping,
    items: items.map((item) =>
      productToAnalyticsItem(item.product, item.quantity),
    ),
    ecommerce_subtotal: subtotal,
  });
}