import type { Product } from "@/lib/products";

export type CartItem = {
  product: Product;
  quantity: number;
};

export const cartStorageKey = "storefront-cart";

export function getCartItems() {
  if (typeof window === "undefined") {
    return [];
  }

  const storedCart = window.localStorage.getItem(cartStorageKey);

  if (!storedCart) {
    return [];
  }

  try {
    const parsed = JSON.parse(storedCart) as CartItem[];
    return parsed.filter(
      (item) =>
        item &&
        typeof item.quantity === "number" &&
        item.quantity > 0 &&
        item.product &&
        typeof item.product.slug === "string" &&
        item.product.slug.length > 0 &&
        typeof item.product.name === "string" &&
        item.product.name.length > 0 &&
        typeof item.product.price === "number" &&
        Number.isFinite(item.product.price),
    );
  } catch {
    return [];
  }
}

export function saveCartItems(items: CartItem[]) {
  const sanitizedItems = items
    .filter((item) => item.quantity > 0)
    .map((item) => ({
      ...item,
      product: {
        ...item.product,
        imageUrl: item.product.imageUrl || "/banners/banner-1.png",
        imageUrls:
          item.product.imageUrls && item.product.imageUrls.length > 0
            ? item.product.imageUrls
            : [item.product.imageUrl || "/banners/banner-1.png"],
      },
    }));

  window.localStorage.setItem(cartStorageKey, JSON.stringify(sanitizedItems));
  window.dispatchEvent(new Event("cart:updated"));
}

export function addProductToCart(product: Product) {
  const items = getCartItems();
  const existingItem = items.find((item) => item.product.slug === product.slug);

  if (existingItem) {
    existingItem.quantity += 1;
    saveCartItems(items);
    return;
  }

  saveCartItems([...items, { product, quantity: 1 }]);
}

export function addProductToCartWithQuantity(product: Product, quantity: number) {
  const safeQuantity = Math.max(1, Math.floor(quantity));
  const items = getCartItems();
  const existingItem = items.find((item) => item.product.slug === product.slug);

  if (existingItem) {
    existingItem.quantity += safeQuantity;
    saveCartItems(items);
    return;
  }

  saveCartItems([...items, { product, quantity: safeQuantity }]);
}

export function upsertCartProductQuantity(product: Product, quantity: number) {
  const safeQuantity = Math.max(1, Math.floor(quantity));
  const items = getCartItems();
  const existingIndex = items.findIndex((item) => item.product.slug === product.slug);

  if (existingIndex >= 0) {
    items[existingIndex] = {
      ...items[existingIndex],
      product,
      quantity: safeQuantity,
    };
    saveCartItems(items);
    return;
  }

  saveCartItems([...items, { product, quantity: safeQuantity }]);
}
