import type { Product } from "@/lib/products";

export const adminProductsStorageKey = "storefront-admin-products";

export function getAdminProducts() {
  if (typeof window === "undefined") {
    return [];
  }

  const storedProducts = window.localStorage.getItem(adminProductsStorageKey);

  if (!storedProducts) {
    return [];
  }

  try {
    return JSON.parse(storedProducts) as Product[];
  } catch {
    return [];
  }
}

export function saveAdminProducts(products: Product[]) {
  window.localStorage.setItem(adminProductsStorageKey, JSON.stringify(products));
  window.dispatchEvent(new Event("admin-products:updated"));
}

export function createProductSlug(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
