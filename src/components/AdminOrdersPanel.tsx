"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  deleteSupabaseOrder,
  fetchSupabaseOrders,
  type OrderRecord,
  type OrderStatus,
  updateSupabaseOrder,
  updateSupabaseOrderStatus,
} from "@/lib/supabase-orders";
import { isValidPhoneNumber, normalizePhoneInput } from "@/lib/phone";

const statuses: OrderStatus[] = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

const emptyEditForm = {
  fullName: "",
  email: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  shippingMethod: "Standard Shipping",
  additionalNotes: "",
  total: "",
  status: "pending" as OrderStatus,
};

export function AdminOrdersPanel() {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | OrderStatus>("all");
  const [sortOrder, setSortOrder] = useState<"latest" | "oldest">("latest");
  const [latestOnly, setLatestOnly] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState(emptyEditForm);

  const loadOrders = useCallback(async () => {
    try {
      setOrders(await fetchSupabaseOrders());
      setMessage("");
    } catch (error) {
      const detail =
        error && typeof error === "object" && "message" in error
          ? String(error.message)
          : "Unknown error";
      setMessage(
        `Unable to load orders. Run supabase/fix-admin-access.sql. ${detail}`,
      );
      setOrders([]);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadOrders();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadOrders]);

  async function updateStatus(id: string, status: OrderStatus) {
    try {
      const order = orders.find((item) => item.id === id);
      await updateSupabaseOrderStatus(id, status);
      if (order) {
        await fetch("/api/orders/status-notify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderNumber: order.orderNumber,
            fullName: order.fullName,
            email: order.email,
            status,
          }),
        }).catch(() => null);
      }
      await loadOrders();
      setMessage("Order status updated.");
    } catch {
      setMessage("Unable to update order status.");
    }
  }

  function startEdit(order: OrderRecord) {
    setEditingId(order.id);
    setEditForm({
      fullName: order.fullName,
      email: order.email,
      phone: order.phone,
      addressLine1: order.addressLine1,
      addressLine2: order.addressLine2,
      city: order.city,
      shippingMethod: order.shippingMethod ?? "Standard Shipping",
      additionalNotes: order.additionalNotes ?? "",
      total: String(order.total),
      status: order.status,
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm(emptyEditForm);
  }

  async function saveEdit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingId) {
      return;
    }

    if (!isValidPhoneNumber(editForm.phone)) {
      setMessage("Please enter a valid phone number (7 to 15 digits).");
      return;
    }

    const total = Number(editForm.total);
    if (!Number.isFinite(total) || total < 0) {
      setMessage("Please enter a valid order total.");
      return;
    }

    try {
      await updateSupabaseOrder(editingId, {
        fullName: editForm.fullName,
        email: editForm.email,
        phone: editForm.phone,
        addressLine1: editForm.addressLine1,
        addressLine2: editForm.addressLine2,
        city: editForm.city,
        shippingMethod: editForm.shippingMethod,
        additionalNotes: editForm.additionalNotes,
        total,
        status: editForm.status,
      });
      cancelEdit();
      await loadOrders();
      setMessage("Order updated.");
    } catch (error) {
      const detail =
        error && typeof error === "object" && "message" in error
          ? String(error.message)
          : "Unknown error";
      setMessage(`Unable to update order: ${detail}`);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this order permanently?")) {
      return;
    }

    try {
      await deleteSupabaseOrder(id);
      if (editingId === id) {
        cancelEdit();
      }
      await loadOrders();
      setMessage("Order deleted.");
    } catch {
      setMessage("Unable to delete order.");
    }
  }

  const visibleOrders = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    let filtered = orders.filter((order) => {
      const matchesStatus = statusFilter === "all" || order.status === statusFilter;
      if (!matchesStatus) {
        return false;
      }

      if (!query) {
        return true;
      }

      return (
        order.orderNumber.toLowerCase().includes(query) ||
        order.fullName.toLowerCase().includes(query) ||
        order.email.toLowerCase().includes(query) ||
        order.phone.toLowerCase().includes(query)
      );
    });

    filtered = [...filtered].sort((a, b) => {
      const aTime = new Date(a.createdAt).getTime();
      const bTime = new Date(b.createdAt).getTime();
      return sortOrder === "latest" ? bTime - aTime : aTime - bTime;
    });

    if (latestOnly) {
      filtered = filtered.slice(0, 10);
    }

    return filtered;
  }, [latestOnly, orders, searchQuery, sortOrder, statusFilter]);

  return (
    <section className="page-shell border-t border-zinc-200">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <p className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
          Orders
        </p>
        <h2 className="mt-3 text-3xl font-bold text-zinc-950">Customer orders</h2>
        {message ? (
          <p className="mt-4 rounded-xl border border-zinc-200 bg-white p-4 text-sm font-semibold text-zinc-700">
            {message}
          </p>
        ) : null}

        {editingId ? (
          <form
            onSubmit={saveEdit}
            className="mt-6 grid gap-3 rounded-xl border border-zinc-200 bg-white p-5 md:grid-cols-2"
          >
            <label className="light-form-field">
              Full name
              <input
                value={editForm.fullName}
                onChange={(event) =>
                  setEditForm((current) => ({ ...current, fullName: event.target.value }))
                }
                required
              />
            </label>
            <label className="light-form-field">
              Email
              <input
                type="email"
                value={editForm.email}
                onChange={(event) =>
                  setEditForm((current) => ({ ...current, email: event.target.value }))
                }
                required
              />
            </label>
            <label className="light-form-field">
              Phone
              <input
                type="tel"
                value={editForm.phone}
                onChange={(event) =>
                  setEditForm((current) => ({
                    ...current,
                    phone: normalizePhoneInput(event.target.value),
                  }))
                }
                required
              />
            </label>
            <label className="light-form-field">
              Total (AED)
              <input
                type="number"
                min="0"
                step="0.01"
                value={editForm.total}
                onChange={(event) =>
                  setEditForm((current) => ({ ...current, total: event.target.value }))
                }
                required
              />
            </label>
            <label className="light-form-field md:col-span-2">
              Address line 1
              <input
                value={editForm.addressLine1}
                onChange={(event) =>
                  setEditForm((current) => ({
                    ...current,
                    addressLine1: event.target.value,
                  }))
                }
                required
              />
            </label>
            <label className="light-form-field">
              Address line 2
              <input
                value={editForm.addressLine2}
                onChange={(event) =>
                  setEditForm((current) => ({
                    ...current,
                    addressLine2: event.target.value,
                  }))
                }
              />
            </label>
            <label className="light-form-field">
              City
              <input
                value={editForm.city}
                onChange={(event) =>
                  setEditForm((current) => ({ ...current, city: event.target.value }))
                }
                required
              />
            </label>
            <label className="light-form-field">
              Status
              <select
                value={editForm.status}
                onChange={(event) =>
                  setEditForm((current) => ({
                    ...current,
                    status: event.target.value as OrderStatus,
                  }))
                }
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>
            <label className="light-form-field md:col-span-2">
              Additional notes
              <textarea
                rows={2}
                value={editForm.additionalNotes}
                onChange={(event) =>
                  setEditForm((current) => ({
                    ...current,
                    additionalNotes: event.target.value,
                  }))
                }
              />
            </label>
            <div className="flex gap-2 md:col-span-2">
              <button type="submit" className="btn-soft">
                Save order
              </button>
              <button type="button" onClick={cancelEdit} className="btn-soft">
                Cancel
              </button>
            </div>
          </form>
        ) : null}

        <div className="mt-5 grid gap-3 md:grid-cols-4">
          <label className="light-form-field">
            Search order/customer
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Order ID, name, email, phone"
            />
          </label>
          <label className="light-form-field">
            Status filter
            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as "all" | OrderStatus)
              }
            >
              <option value="all">All statuses</option>
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
          <label className="light-form-field">
            Sort by date
            <select
              value={sortOrder}
              onChange={(event) =>
                setSortOrder(event.target.value as "latest" | "oldest")
              }
            >
              <option value="latest">Latest first</option>
              <option value="oldest">Oldest first</option>
            </select>
          </label>
          <label className="light-form-field">
            Quick list
            <select
              value={latestOnly ? "latest10" : "all"}
              onChange={(event) => setLatestOnly(event.target.value === "latest10")}
            >
              <option value="all">All matching orders</option>
              <option value="latest10">Latest 10 orders</option>
            </select>
          </label>
        </div>
        <div className="mt-7 space-y-4">
          {visibleOrders.length === 0 ? (
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-zinc-600">
              No orders found for the selected filters.
            </div>
          ) : null}
          {visibleOrders.map((order) => (
            <article
              key={order.id}
              className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-col justify-between gap-4 md:flex-row">
                <div>
                  <p className="text-sm font-bold uppercase tracking-wider text-zinc-500">
                    {order.orderNumber}
                  </p>
                  <h3 className="mt-2 text-xl font-bold text-zinc-950">
                    {order.fullName}
                  </h3>
                  <p className="mt-1 text-sm text-zinc-600">
                    {order.phone} | {order.email}
                  </p>
                  <p className="mt-1 text-sm text-zinc-600">
                    {order.addressLine1} {order.addressLine2} {order.city}
                  </p>
                  <p className="mt-1 text-sm text-zinc-600">
                    Shipping: {order.shippingMethod}
                  </p>
                  {order.additionalNotes ? (
                    <p className="mt-1 text-sm text-zinc-600">
                      Notes: {order.additionalNotes}
                    </p>
                  ) : null}
                </div>
                <div className="flex flex-col gap-2">
                  <label className="light-form-field min-w-52">
                    Status
                    <select
                      value={order.status}
                      onChange={(event) =>
                        updateStatus(order.id, event.target.value as OrderStatus)
                      }
                    >
                      {statuses.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => startEdit(order)}
                      className="rounded border border-zinc-300 px-3 py-2 text-xs font-semibold"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleDelete(order.id)}
                      className="rounded border border-red-300 px-3 py-2 text-xs font-semibold text-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {order.items.map((item) => (
                  <div
                    key={item.product.slug}
                    className="rounded-xl border border-zinc-200 p-3 text-sm"
                  >
                    <p className="font-bold text-zinc-950">{item.product.name}</p>
                    <p className="text-zinc-600">Qty: {item.quantity}</p>
                    <p className="text-zinc-600">AED {item.product.price}</p>
                  </div>
                ))}
              </div>
              <p className="mt-5 text-lg font-bold text-zinc-950">
                Total: AED {order.total}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
