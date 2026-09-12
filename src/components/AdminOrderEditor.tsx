"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  fetchSupabaseOrderByNumber,
  updateSupabaseOrder,
  type OrderRecord,
  type OrderStatus,
} from "@/lib/supabase-orders";

import {
  fetchSupabaseProducts,
} from "@/lib/supabase-products";

import {
  isProductAvailableForPurchase,
  type CartItem,
} from "@/lib/cart";

import type { Product } from "@/lib/products";

import {
  defaultSiteSettings,
  fetchSiteSettings,
} from "@/lib/site-settings";

import {
  isValidPhoneNumber,
  normalizePhoneInput,
} from "@/lib/phone";

import { supabase } from "@/lib/supabase";

const statuses: OrderStatus[] = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

const statusLabels: Record<
  OrderStatus,
  string
> = {
  pending: "Pending",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const statusClasses: Record<
  OrderStatus,
  string
> = {
  pending:
    "bg-amber-50 text-amber-700 ring-amber-600/10",
  processing:
    "bg-blue-50 text-blue-700 ring-blue-600/10",
  shipped:
    "bg-violet-50 text-violet-700 ring-violet-600/10",
  delivered:
    "bg-emerald-50 text-emerald-700 ring-emerald-600/10",
  cancelled:
    "bg-red-50 text-red-700 ring-red-600/10",
};

type EditForm = {
  fullName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  additionalNotes: string;
  status: OrderStatus;
};

function createEditForm(
  order: OrderRecord,
): EditForm {
  return {
    fullName: order.fullName,
    email: order.email,
    phone: order.phone,
    addressLine1:
      order.addressLine1,
    addressLine2:
      order.addressLine2,
    city: order.city,
    additionalNotes:
      order.additionalNotes ?? "",
    status: order.status,
  };
}

function formatMoney(
  value: number,
) {
  return new Intl.NumberFormat(
    "en-AE",
    {
      style: "currency",
      currency: "AED",
      minimumFractionDigits: 2,
    },
  ).format(value);
}

function formatDate(
  value: string,
) {
  const date = new Date(value);

  if (
    Number.isNaN(date.getTime())
  ) {
    return value;
  }

  return new Intl.DateTimeFormat(
    "en-AE",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
  ).format(date);
}

function calculateItemsSubtotal(
  items: CartItem[],
) {
  return items.reduce(
    (sum, item) =>
      sum +
      item.product.price *
        item.quantity,
    0,
  );
}

function createWhatsAppUrl(
  phone: string,
  orderNumber: string,
) {
  let digits =
    phone.replace(/\D/g, "");

  if (
    digits.startsWith("0") &&
    digits.length === 10
  ) {
    digits =
      `971${digits.slice(1)}`;
  }

  const message =
    `Hello, this is HM Shop Online regarding your order ${orderNumber}.`;

  return (
    `https://wa.me/${digits}` +
    `?text=${encodeURIComponent(
      message,
    )}`
  );
}

function getAllowedStatuses(currentStatus: OrderStatus): OrderStatus[] {
  switch (currentStatus) {
    case "pending":
      return ["pending", "processing", "cancelled"];

    case "processing":
      return ["processing", "shipped", "cancelled"];

    case "shipped":
      return ["shipped", "delivered"];

    case "delivered":
      return ["delivered"];

    case "cancelled":
      return ["cancelled"];

    default:
      return [currentStatus];
  }
}

export function AdminOrderEditor({
  orderNumber,
}: {
  orderNumber: string;
}) {
  const [order, setOrder] =
    useState<OrderRecord | null>(
      null,
    );

  const [form, setForm] =
    useState<EditForm | null>(
      null,
    );

  const [items, setItems] =
    useState<CartItem[]>([]);

  const [products, setProducts] =
    useState<Product[]>([]);

  const [productSearch, setProductSearch] =
    useState("");

  const [
    baseShippingCharge,
    setBaseShippingCharge,
  ] = useState(
    defaultSiteSettings.shippingCharge,
  );

  const [message, setMessage] =
    useState("");

  const [isLoading, setIsLoading] =
    useState(true);

  const [isSaving, setIsSaving] =
    useState(false);

  const loadOrder =
    useCallback(async () => {
      setIsLoading(true);

      try {
        const [
          loadedOrder,
          loadedProducts,
          settings,
        ] = await Promise.all([
          fetchSupabaseOrderByNumber(
            orderNumber,
          ),

          fetchSupabaseProducts(),

          fetchSiteSettings().catch(
            () =>
              defaultSiteSettings,
          ),
        ]);

        if (!loadedOrder) {
          setOrder(null);
          setForm(null);
          setItems([]);
          setMessage(
            "Order not found.",
          );
          return;
        }

        setOrder(loadedOrder);

        setForm(
          createEditForm(
            loadedOrder,
          ),
        );

        setItems(
          loadedOrder.items.map(
            (item) => ({
              ...item,
              product: {
                ...item.product,
              },
            }),
          ),
        );

        setProducts(
          loadedProducts,
        );

        setBaseShippingCharge(
          settings.shippingCharge,
        );

        setMessage("");
      } catch (error) {
        const detail =
          error &&
          typeof error ===
            "object" &&
          "message" in error
            ? String(
                error.message,
              )
            : "Unknown error";

        setMessage(
          `Unable to load order. ${detail}`,
        );
      } finally {
        setIsLoading(false);
      }
    }, [orderNumber]);

  useEffect(() => {
    const timer =
      window.setTimeout(() => {
        void loadOrder();
      }, 0);

    return () =>
      window.clearTimeout(
        timer,
      );
  }, [loadOrder]);

  const originalItemsSubtotal =
    useMemo(() => {
      if (!order) {
        return 0;
      }

      return calculateItemsSubtotal(
        order.items,
      );
    }, [order]);

  const originalShippingCharge =
    useMemo(() => {
      if (!order) {
        return 0;
      }

      return Math.max(
        0,
        Number(
          (
            order.total -
            originalItemsSubtotal
          ).toFixed(2),
        ),
      );
    }, [
      order,
      originalItemsSubtotal,
    ]);

  const itemsSubtotal =
    useMemo(
      () =>
        calculateItemsSubtotal(
          items,
        ),
      [items],
    );

  const shippingCharge =
    useMemo(() => {
      if (items.length === 0) {
        return 0;
      }

      const allFreeShipping =
        items.every((item) =>
          Boolean(
            item.product
              .freeShipping,
          ),
        );

      if (allFreeShipping) {
        return 0;
      }

      if (
        originalShippingCharge >
        0
      ) {
        return originalShippingCharge;
      }

      return Math.max(
        0,
        baseShippingCharge,
      );
    }, [
      items,
      originalShippingCharge,
      baseShippingCharge,
    ]);

  const grandTotal =
    itemsSubtotal +
    shippingCharge;

  const canEditItems =
    order?.status === "pending" ||
    order?.status ===
      "processing";

  const allowedStatuses = order
    ? getAllowedStatuses(order.status)
    : [];

  const availableProducts =
    useMemo(() => {
      const query =
        productSearch
          .trim()
          .toLowerCase();

      if (!query) {
        return [];
      }

      const existingSlugs =
        new Set(
          items.map(
            (item) =>
              item.product.slug,
          ),
        );

      return products
        .filter(
          (product) =>
            !existingSlugs.has(
              product.slug,
            ),
        )
        .filter(
          isProductAvailableForPurchase,
        )
        .filter((product) => {
          return (
            product.name
              .toLowerCase()
              .includes(query) ||
            product.slug
              .toLowerCase()
              .includes(query) ||
            (
              product.sku ?? ""
            )
              .toLowerCase()
              .includes(query) ||
            (
              product.brand ?? ""
            )
              .toLowerCase()
              .includes(query)
          );
        })
        .slice(0, 8);
    }, [
      items,
      productSearch,
      products,
    ]);

  function changeQuantity(
    slug: string,
    quantity: number,
  ) {
    if (!canEditItems) {
      return;
    }

    const safeQuantity =
      Math.max(
        1,
        Math.floor(quantity),
      );

    setItems((current) =>
      current.map((item) =>
        item.product.slug ===
        slug
          ? {
              ...item,
              quantity:
                safeQuantity,
            }
          : item,
      ),
    );
  }

  function removeItem(
    slug: string,
  ) {
    if (!canEditItems) {
      return;
    }

    setItems((current) =>
      current.filter(
        (item) =>
          item.product.slug !==
          slug,
      ),
    );
  }

  function addProduct(
    product: Product,
  ) {
    if (
      !canEditItems ||
      !isProductAvailableForPurchase(
        product,
      )
    ) {
      return;
    }

    setItems((current) => [
      ...current,
      {
        product: {
          ...product,
        },
        quantity: 1,
      },
    ]);

    setProductSearch("");
  }

  async function sendStatusNotification(
    updatedOrder: OrderRecord,
  ) {
    const {
      data: { session },
    } =
      await supabase.auth.getSession();

    if (
      !session?.access_token
    ) {
      return false;
    }

    const response =
      await fetch(
        "/api/orders/status-notify",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${session.access_token}`,
          },

          body: JSON.stringify({
            orderNumber:
              updatedOrder.orderNumber,

            fullName:
              updatedOrder.fullName,

            email:
              updatedOrder.email,

            status:
              updatedOrder.status,
          }),
        },
      ).catch(() => null);

    return Boolean(
      response?.ok,
    );
  }

  async function handleSave() {
    if (
      !order ||
      !form
    ) {
      return;
    }

    if (
      !form.fullName.trim() ||
      !form.email.trim() ||
      !form.addressLine1.trim() ||
      !form.city.trim()
    ) {
      setMessage(
        "Please complete the required customer and delivery details.",
      );
      return;
    }

    if (
      !isValidPhoneNumber(
        form.phone,
      )
    ) {
      setMessage(
        "Please enter a valid phone number.",
      );
      return;
    }

    if (
      items.length === 0
    ) {
      setMessage(
        "An order must contain at least one item.",
      );
      return;
    }

    const statusChanged =
      form.status !==
      order.status;

    const allowedSaveStatuses =
      getAllowedStatuses(order.status);

    if (
      !allowedSaveStatuses.includes(
        form.status,
      )
    ) {
      setMessage(
        `Order status cannot move from ${statusLabels[order.status]} to ${statusLabels[form.status]}.`,
      );
      return;
    }

    const itemsChanged =
      JSON.stringify(items) !==
      JSON.stringify(
        order.items,
      );

    if (
      itemsChanged &&
      !canEditItems
    ) {
      setMessage(
        "Order items cannot be changed after an order is shipped, delivered or cancelled.",
      );
      return;
    }

    if (itemsChanged) {
      const oldTotal =
        formatMoney(
          order.total,
        );

      const newTotal =
        formatMoney(
          grandTotal,
        );

      const confirmed =
        window.confirm(
          `Order items have changed.\n\nPrevious total: ${oldTotal}\nNew total: ${newTotal}\n\nSave revised order?`,
        );

      if (!confirmed) {
        return;
      }
    }

    setIsSaving(true);
    setMessage("");

    try {
      const updated =
        await updateSupabaseOrder(
          order.id,
          {
            fullName:
              form.fullName.trim(),

            email:
              form.email
                .trim()
                .toLowerCase(),

            phone:
              form.phone.trim(),

            addressLine1:
              form.addressLine1.trim(),

            addressLine2:
              form.addressLine2.trim(),

            city:
              form.city.trim(),

            additionalNotes:
              form.additionalNotes.trim(),

            shippingMethod:
              shippingCharge === 0
                ? "Free Shipping"
                : "Standard Shipping",

            items,

            total:
              Number(
                grandTotal.toFixed(
                  2,
                ),
              ),

            status:
              form.status,
          },
        );

      setOrder(updated);

      setForm(
        createEditForm(
          updated,
        ),
      );

      setItems(
        updated.items.map(
          (item) => ({
            ...item,
            product: {
              ...item.product,
            },
          }),
        ),
      );

      if (statusChanged) {
        const notified =
          await sendStatusNotification(
            updated,
          );

        setMessage(
          notified
            ? "Order saved and status notification sent."
            : "Order saved, but the status notification email could not be confirmed.",
        );
      } else {
        setMessage(
          "Order saved successfully.",
        );
      }
    } catch (error) {
      const detail =
        error &&
        typeof error ===
          "object" &&
        "message" in error
          ? String(
              error.message,
            )
          : "Unknown error";

      setMessage(
        `Unable to save order. ${detail}`,
      );
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-sm font-semibold text-zinc-500 shadow-sm">
        Loading order...
      </div>
    );
  }

  if (
    !order ||
    !form
  ) {
    return (
      <div className="space-y-4">
        <Link
          href="/admin/orders"
          className="text-sm font-bold text-orange-600"
        >
          ← Back to Orders
        </Link>

        <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-sm font-semibold text-zinc-600 shadow-sm">
          {message ||
            "Order not found."}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/orders"
          className="inline-flex text-sm font-bold text-zinc-500 transition hover:text-orange-600"
        >
          ← Back to Orders
        </Link>

        <div className="mt-4 flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-500">
              Order Management
            </p>

            <h1 className="mt-2 text-3xl font-black tracking-tight text-zinc-950">
              {order.orderNumber}
            </h1>

            <p className="mt-2 text-sm font-medium text-zinc-500">
              Placed{" "}
              {formatDate(
                order.createdAt,
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span
              className={`inline-flex rounded-full px-3 py-1.5 text-xs font-bold ring-1 ring-inset ${
                statusClasses[
                  form.status
                ]
              }`}
            >
              {
                statusLabels[
                  form.status
                ]
              }
            </span>

            <a
              href={createWhatsAppUrl(
                form.phone,
                order.orderNumber,
              )}
              target="_blank"
              rel="noreferrer"
              className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-bold text-emerald-700 transition hover:bg-emerald-100"
            >
              WhatsApp Customer
            </a>
          </div>
        </div>
      </div>

      {message ? (
        <div className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold text-zinc-700 shadow-sm">
          {message}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <SectionTitle
            title="Customer"
            description="Customer contact information for this order."
          />

          <div className="mt-5 grid gap-4">
            <Field label="Full name">
              <input
                value={
                  form.fullName
                }
                onChange={(
                  event,
                ) =>
                  setForm(
                    (
                      current,
                    ) =>
                      current
                        ? {
                            ...current,
                            fullName:
                              event
                                .target
                                .value,
                          }
                        : current,
                  )
                }
                className="admin-order-input"
              />
            </Field>

            <Field label="Email">
              <input
                type="email"
                value={form.email}
                onChange={(
                  event,
                ) =>
                  setForm(
                    (
                      current,
                    ) =>
                      current
                        ? {
                            ...current,
                            email:
                              event
                                .target
                                .value,
                          }
                        : current,
                  )
                }
                className="admin-order-input"
              />
            </Field>

            <Field label="Phone">
              <input
                type="tel"
                value={form.phone}
                onChange={(
                  event,
                ) =>
                  setForm(
                    (
                      current,
                    ) =>
                      current
                        ? {
                            ...current,
                            phone:
                              normalizePhoneInput(
                                event
                                  .target
                                  .value,
                              ),
                          }
                        : current,
                  )
                }
                className="admin-order-input"
              />
            </Field>
          </div>
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <SectionTitle
            title="Delivery"
            description="Delivery address and order fulfilment information."
          />

          <div className="mt-5 grid gap-4">
            <Field label="Address line 1">
              <input
                value={
                  form.addressLine1
                }
                onChange={(
                  event,
                ) =>
                  setForm(
                    (
                      current,
                    ) =>
                      current
                        ? {
                            ...current,
                            addressLine1:
                              event
                                .target
                                .value,
                          }
                        : current,
                  )
                }
                className="admin-order-input"
              />
            </Field>

            <Field label="Address line 2">
              <input
                value={
                  form.addressLine2
                }
                onChange={(
                  event,
                ) =>
                  setForm(
                    (
                      current,
                    ) =>
                      current
                        ? {
                            ...current,
                            addressLine2:
                              event
                                .target
                                .value,
                          }
                        : current,
                  )
                }
                className="admin-order-input"
              />
            </Field>

            <Field label="City / Emirate">
              <input
                value={form.city}
                onChange={(
                  event,
                ) =>
                  setForm(
                    (
                      current,
                    ) =>
                      current
                        ? {
                            ...current,
                            city:
                              event
                                .target
                                .value,
                          }
                        : current,
                  )
                }
                className="admin-order-input"
              />
            </Field>
          </div>
        </section>
      </div>

      <section className="rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <div className="border-b border-zinc-100 p-5">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <SectionTitle
              title="Order Items"
              description={
                canEditItems
                  ? "Change quantity, remove items or add products while this order is pending or processing."
                  : "Order items are locked after shipment, delivery or cancellation."
              }
            />

            {!canEditItems ? (
              <span className="rounded-full bg-zinc-100 px-3 py-1.5 text-xs font-bold text-zinc-500">
                Items Locked
              </span>
            ) : null}
          </div>
        </div>

        <div className="divide-y divide-zinc-100">
          {items.map(
            (item) => (
              <div
                key={
                  item.product
                    .slug
                }
                className="grid gap-4 p-5 md:grid-cols-[72px_minmax(0,1fr)_160px_120px_90px] md:items-center"
              >
                <div className="relative h-16 w-16 overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50">
                  <Image
                    src={
                      item.product
                        .imageUrl ||
                      "/banners/banner-1.png"
                    }
                    alt={
                      item.product
                        .name
                    }
                    fill
                    sizes="64px"
                    className="object-contain p-1"
                    unoptimized
                  />
                </div>

                <div>
                  <p className="font-bold text-zinc-950">
                    {
                      item.product
                        .name
                    }
                  </p>

                  <p className="mt-1 text-xs text-zinc-500">
                    Stored price:{" "}
                    {formatMoney(
                      item.product
                        .price,
                    )}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={
                      !canEditItems ||
                      item.quantity <=
                        1
                    }
                    onClick={() =>
                      changeQuantity(
                        item.product
                          .slug,
                        item.quantity -
                          1,
                      )
                    }
                    className="h-9 w-9 rounded-lg border border-zinc-200 bg-white text-lg font-bold text-zinc-700 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    −
                  </button>

                  <input
                    type="number"
                    min="1"
                    value={
                      item.quantity
                    }
                    disabled={
                      !canEditItems
                    }
                    onChange={(
                      event,
                    ) =>
                      changeQuantity(
                        item.product
                          .slug,
                        Number(
                          event
                            .target
                            .value,
                        ),
                      )
                    }
                    className="h-9 w-14 rounded-lg border border-zinc-200 text-center text-sm font-bold outline-none focus:border-orange-300"
                  />

                  <button
                    type="button"
                    disabled={
                      !canEditItems
                    }
                    onClick={() =>
                      changeQuantity(
                        item.product
                          .slug,
                        item.quantity +
                          1,
                      )
                    }
                    className="h-9 w-9 rounded-lg border border-zinc-200 bg-white text-lg font-bold text-zinc-700 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    +
                  </button>
                </div>

                <p className="font-black text-zinc-950">
                  {formatMoney(
                    item.product
                      .price *
                      item.quantity,
                  )}
                </p>

                <button
                  type="button"
                  disabled={
                    !canEditItems
                  }
                  onClick={() => {
                    if (
                      window.confirm(
                        `Remove ${item.product.name} from this order?`,
                      )
                    ) {
                      removeItem(
                        item.product
                          .slug,
                      );
                    }
                  }}
                  className="text-left text-xs font-bold text-red-600 disabled:cursor-not-allowed disabled:opacity-30 md:text-center"
                >
                  Remove
                </button>
              </div>
            ),
          )}
        </div>

        {canEditItems ? (
          <div className="border-t border-zinc-100 bg-zinc-50 p-5">
            <p className="text-sm font-black text-zinc-900">
              Add Product
            </p>

            <p className="mt-1 text-xs text-zinc-500">
              Newly added products use their current selling price.
            </p>

            <div className="relative mt-3 max-w-xl">
              <input
                value={
                  productSearch
                }
                onChange={(
                  event,
                ) =>
                  setProductSearch(
                    event
                      .target
                      .value,
                  )
                }
                placeholder="Search product name, SKU or brand..."
                className="admin-order-input"
              />

              {productSearch.trim() ? (
                <div className="absolute z-20 mt-2 max-h-80 w-full overflow-y-auto rounded-xl border border-zinc-200 bg-white shadow-xl">
                  {availableProducts.length >
                  0 ? (
                    availableProducts.map(
                      (
                        product,
                      ) => (
                        <button
                          key={
                            product.slug
                          }
                          type="button"
                          onClick={() =>
                            addProduct(
                              product,
                            )
                          }
                          className="flex w-full items-center gap-3 border-b border-zinc-100 p-3 text-left transition last:border-b-0 hover:bg-orange-50"
                        >
                          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-zinc-200 bg-white">
                            <Image
                              src={
                                product.imageUrl ||
                                "/banners/banner-1.png"
                              }
                              alt={
                                product.name
                              }
                              fill
                              sizes="48px"
                              className="object-contain p-1"
                              unoptimized
                            />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-bold text-zinc-900">
                              {
                                product.name
                              }
                            </p>

                            <p className="mt-0.5 text-xs text-zinc-500">
                              {formatMoney(
                                product.price,
                              )}
                            </p>
                          </div>

                          <span className="text-xs font-bold text-orange-600">
                            Add
                          </span>
                        </button>
                      ),
                    )
                  ) : (
                    <p className="p-4 text-sm font-semibold text-zinc-500">
                      No available products found.
                    </p>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        ) : null}

        <div className="border-t border-zinc-200 p-5">
          <div className="ml-auto max-w-sm space-y-3">
            <SummaryRow
              label="Items subtotal"
              value={formatMoney(
                itemsSubtotal,
              )}
            />

            <SummaryRow
              label="Shipping"
              value={
                shippingCharge ===
                0
                  ? "Free"
                  : formatMoney(
                      shippingCharge,
                    )
              }
            />

            <div className="border-t border-zinc-200 pt-3">
              <SummaryRow
                label="Order total"
                value={formatMoney(
                  grandTotal,
                )}
                strong
              />
            </div>

            {order.total !==
            grandTotal ? (
              <p className="text-right text-xs font-semibold text-orange-600">
                Saved total:{" "}
                {formatMoney(
                  order.total,
                )}
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <SectionTitle
            title="Customer Notes"
            description="Delivery instructions or notes supplied for this order."
          />

          <textarea
            rows={5}
            value={
              form.additionalNotes
            }
            onChange={(
              event,
            ) =>
              setForm(
                (current) =>
                  current
                    ? {
                        ...current,
                        additionalNotes:
                          event
                            .target
                            .value,
                      }
                    : current,
              )
            }
            className="admin-order-input mt-5 resize-y"
            placeholder="No additional notes"
          />
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <SectionTitle
            title="Order Status"
            description="Changing status will notify the customer after saving."
          />

          <select
            value={form.status}
            onChange={(
              event,
            ) =>
              setForm(
                (current) =>
                  current
                    ? {
                        ...current,
                        status:
                          event
                            .target
                            .value as OrderStatus,
                      }
                    : current,
              )
            }
            className="admin-order-input mt-5"
          >
            {allowedStatuses.map(
              (status) => (
                <option
                  key={status}
                  value={status}
                >
                  {
                    statusLabels[
                      status
                    ]
                  }
                </option>
              ),
            )}
          </select>

          <p className="mt-3 text-xs leading-5 text-zinc-500">
            Item editing is available only for Pending and Processing orders.
          </p>
        </section>
      </div>

      <div className="sticky bottom-0 z-30 -mx-4 border-t border-zinc-200 bg-white/95 px-4 py-3 shadow-[0_-10px_30px_rgba(0,0,0,0.06)] backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="hidden sm:block">
            <p className="text-xs font-semibold text-zinc-500">
              {order.orderNumber}
            </p>

            <p className="text-sm font-black text-zinc-950">
              {formatMoney(
                grandTotal,
              )}
            </p>
          </div>

          <div className="ml-auto flex gap-3">
            <Link
              href="/admin/orders"
              className="rounded-xl border border-zinc-200 bg-white px-5 py-3 text-sm font-bold text-zinc-700 transition hover:bg-zinc-50"
            >
              Cancel
            </Link>

            <button
              type="button"
              onClick={() =>
                void handleSave()
              }
              disabled={isSaving}
              className="rounded-xl bg-orange-500 px-6 py-3 text-sm font-black text-white shadow-sm transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving
                ? "Saving..."
                : "Save Order"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionTitle({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div>
      <h2 className="text-lg font-black text-zinc-950">
        {title}
      </h2>

      <p className="mt-1 text-xs leading-5 text-zinc-500">
        {description}
      </p>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-1.5">
      <span className="text-xs font-bold text-zinc-600">
        {label}
      </span>

      {children}
    </label>
  );
}

function SummaryRow({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-6">
      <span
        className={
          strong
            ? "text-base font-black text-zinc-950"
            : "text-sm font-semibold text-zinc-500"
        }
      >
        {label}
      </span>

      <span
        className={
          strong
            ? "text-xl font-black text-zinc-950"
            : "text-sm font-bold text-zinc-800"
        }
      >
        {value}
      </span>
    </div>
  );
}