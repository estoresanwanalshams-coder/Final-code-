"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  fetchSupabaseCustomers,
  updateSupabaseCustomer,
  type CustomerRecord,
} from "@/lib/supabase-customers";

import { fetchSupabaseOrders, type OrderRecord } from "@/lib/supabase-orders";

import { isValidPhoneNumber, normalizePhoneInput } from "@/lib/phone";

type EditForm = {
  fullName: string;
  email: string;
  phone: string;
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-AE", {
    style: "currency",
    currency: "AED",
    minimumFractionDigits: 2,
  }).format(value);
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-AE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function createWhatsAppUrl(phone: string) {
  let digits = phone.replace(/\D/g, "");

  if (digits.startsWith("0") && digits.length === 10) {
    digits = `971${digits.slice(1)}`;
  }

  const message = "Hello, this is HM Shop Online.";

  return `https://wa.me/${digits}` + `?text=${encodeURIComponent(message)}`;
}

function createForm(customer: CustomerRecord): EditForm {
  return {
    fullName: customer.fullName,
    email: customer.email,
    phone: customer.phone,
  };
}

export function AdminCustomerEditor({ customerId }: { customerId: string }) {
  const [customer, setCustomer] = useState<CustomerRecord | null>(null);

  const [form, setForm] = useState<EditForm | null>(null);

  const [orders, setOrders] = useState<OrderRecord[]>([]);

  const [message, setMessage] = useState("");

  const [isLoading, setIsLoading] = useState(true);

  const [isSaving, setIsSaving] = useState(false);

  const loadCustomer = useCallback(async () => {
    setIsLoading(true);

    try {
      const [customers, allOrders] = await Promise.all([
        fetchSupabaseCustomers(),
        fetchSupabaseOrders(),
      ]);

      const matchedCustomer =
        customers.find((item) => item.id === customerId) ?? null;

      if (!matchedCustomer) {
        setCustomer(null);
        setForm(null);
        setOrders([]);
        setMessage("Customer not found.");
        return;
      }

      const customerOrders = allOrders
        .filter(
          (order) =>
            normalizeEmail(order.email) ===
            normalizeEmail(matchedCustomer.email),
        )
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );

      setCustomer(matchedCustomer);

      setForm(createForm(matchedCustomer));

      setOrders(customerOrders);

      setMessage("");
    } catch (error) {
      const detail =
        error && typeof error === "object" && "message" in error
          ? String(error.message)
          : "Unknown error";

      setMessage(`Unable to load customer. ${detail}`);
    } finally {
      setIsLoading(false);
    }
  }, [customerId]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadCustomer();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadCustomer]);

  const totalSpent = useMemo(
    () => orders.reduce((total, order) => total + order.total, 0),
    [orders],
  );

  const deliveredCount = useMemo(
    () => orders.filter((order) => order.status === "delivered").length,
    [orders],
  );

  const cancelledCount = useMemo(
    () => orders.filter((order) => order.status === "cancelled").length,
    [orders],
  );

  const lastOrder = orders[0] ?? null;

  async function handleSave() {
    if (!customer || !form) {
      return;
    }

    if (!form.fullName.trim() || !form.email.trim()) {
      setMessage("Name and email are required.");
      return;
    }

    if (!isValidPhoneNumber(form.phone)) {
      setMessage("Please enter a valid phone number.");
      return;
    }

    const emailChanged =
      normalizeEmail(form.email) !== normalizeEmail(customer.email);

    if (emailChanged) {
      const confirmed = window.confirm(
        "Changing the customer email may affect how historical orders are matched to this profile.\n\nContinue?",
      );

      if (!confirmed) {
        return;
      }
    }

    setIsSaving(true);
    setMessage("");

    try {
      const updated = await updateSupabaseCustomer(customer.id, {
        fullName: form.fullName.trim(),

        email: form.email.trim().toLowerCase(),

        phone: form.phone.trim(),
      });

      setCustomer(updated);

      setForm(createForm(updated));

      const successMessage = emailChanged
        ? "Customer updated. Order history may change because orders are matched by email."
        : "Customer updated successfully.";

      await loadCustomer();

      setMessage(successMessage);
    } catch (error) {
      const detail =
        error && typeof error === "object" && "message" in error
          ? String(error.message)
          : "Unknown error";

      setMessage(`Unable to update customer. ${detail}`);
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-sm font-semibold text-zinc-500 shadow-sm">
        Loading customer...
      </div>
    );
  }

  if (!customer || !form) {
    return (
      <div className="space-y-4">
        <Link
          href="/admin/customers"
          className="text-sm font-bold text-orange-600"
        >
          ← Back to Customers
        </Link>

        <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-sm font-semibold text-zinc-600 shadow-sm">
          {message || "Customer not found."}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/customers"
          className="inline-flex text-sm font-bold text-zinc-500 transition hover:text-orange-600"
        >
          ← Back to Customers
        </Link>

        <div className="mt-4 flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-500">
              Customer Management
            </p>

            <h1 className="mt-2 text-3xl font-black tracking-tight text-zinc-950">
              {customer.fullName}
            </h1>

            <div className="mt-3 flex flex-wrap gap-2">
              <span
                className={
                  customer.authUserId
                    ? "inline-flex rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 ring-1 ring-inset ring-emerald-600/10"
                    : "inline-flex rounded-full bg-zinc-100 px-3 py-1.5 text-xs font-bold text-zinc-600 ring-1 ring-inset ring-zinc-500/10"
                }
              >
                {customer.authUserId
                  ? "Registered Customer"
                  : "Manual Customer"}
              </span>

              <span className="inline-flex rounded-full bg-zinc-100 px-3 py-1.5 text-xs font-bold text-zinc-600">
                Customer since {formatDate(customer.createdAt)}
              </span>
            </div>
          </div>

          <a
            href={createWhatsAppUrl(form.phone)}
            target="_blank"
            rel="noreferrer"
            className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-bold text-emerald-700 transition hover:bg-emerald-100"
          >
            WhatsApp Customer
          </a>
        </div>
      </div>

      {message ? (
        <div className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold text-zinc-700 shadow-sm">
          {message}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Orders" value={orders.length} />

        <StatCard label="Total Spent" value={formatMoney(totalSpent)} />

        <StatCard label="Delivered" value={deliveredCount} />

        <StatCard label="Cancelled" value={cancelledCount} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <SectionTitle
            title="Customer Details"
            description="Contact information stored in the HM customer profile."
          />

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <Field label="Full name">
              <input
                value={form.fullName}
                onChange={(event) =>
                  setForm((current) =>
                    current
                      ? {
                          ...current,
                          fullName: event.target.value,
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
                onChange={(event) =>
                  setForm((current) =>
                    current
                      ? {
                          ...current,
                          phone: normalizePhoneInput(event.target.value),
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
                onChange={(event) =>
                  setForm((current) =>
                    current
                      ? {
                          ...current,
                          email: event.target.value,
                        }
                      : current,
                  )
                }
                className="admin-order-input md:col-span-2"
              />
            </Field>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => void handleSave()}
              disabled={isSaving}
              className="rounded-xl bg-orange-500 px-5 py-3 text-sm font-black text-white shadow-sm transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? "Saving..." : "Save Customer"}
            </button>

            <button
              type="button"
              onClick={() => setForm(createForm(customer))}
              className="rounded-xl border border-zinc-200 bg-white px-5 py-3 text-sm font-bold text-zinc-700 transition hover:bg-zinc-50"
            >
              Reset Changes
            </button>
          </div>
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <SectionTitle
            title="Latest Order"
            description="Most recent order associated with this email address."
          />

          {lastOrder ? (
            <div className="mt-5">
              <Link
                href={`/admin/orders/${encodeURIComponent(
                  lastOrder.orderNumber,
                )}`}
                className="text-lg font-black text-zinc-950 transition hover:text-orange-600"
              >
                {lastOrder.orderNumber}
              </Link>

              <p className="mt-2 text-sm font-semibold capitalize text-zinc-600">
                {lastOrder.status}
              </p>

              <p className="mt-1 text-sm text-zinc-500">
                {formatDate(lastOrder.createdAt)}
              </p>

              <p className="mt-4 text-2xl font-black text-zinc-950">
                {formatMoney(lastOrder.total)}
              </p>

              <Link
                href={`/admin/orders/${encodeURIComponent(
                  lastOrder.orderNumber,
                )}`}
                className="mt-5 inline-flex rounded-lg border border-zinc-200 px-3 py-2 text-xs font-bold text-zinc-700 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-700"
              >
                Manage Order
              </Link>
            </div>
          ) : (
            <p className="mt-5 text-sm font-semibold text-zinc-400">
              No order history found.
            </p>
          )}
        </section>
      </div>

      <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <div className="border-b border-zinc-100 p-5">
          <SectionTitle
            title="Order History"
            description="Orders matched to this customer using their email address."
          />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[760px] w-full">
            <thead className="border-b border-zinc-200 bg-zinc-50">
              <tr>
                <TableHeading>Order</TableHeading>

                <TableHeading>Date</TableHeading>

                <TableHeading>Items</TableHeading>

                <TableHeading>Total</TableHeading>

                <TableHeading>Status</TableHeading>

                <TableHeading>Action</TableHeading>
              </tr>
            </thead>

            <tbody className="divide-y divide-zinc-100">
              {orders.map((order) => (
                <tr key={order.id} className="transition hover:bg-zinc-50/80">
                  <td className="px-5 py-4">
                    <Link
                      href={`/admin/orders/${encodeURIComponent(
                        order.orderNumber,
                      )}`}
                      className="text-sm font-black text-zinc-950 transition hover:text-orange-600"
                    >
                      {order.orderNumber}
                    </Link>
                  </td>

                  <td className="whitespace-nowrap px-5 py-4 text-xs font-semibold text-zinc-500">
                    {formatDate(order.createdAt)}
                  </td>

                  <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-zinc-700">
                    {order.items.reduce(
                      (total, item) => total + item.quantity,
                      0,
                    )}
                  </td>

                  <td className="whitespace-nowrap px-5 py-4 text-sm font-black text-zinc-950">
                    {formatMoney(order.total)}
                  </td>

                  <td className="whitespace-nowrap px-5 py-4">
                    <span className="inline-flex rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-bold capitalize text-zinc-600">
                      {order.status}
                    </span>
                  </td>

                  <td className="whitespace-nowrap px-5 py-4">
                    <Link
                      href={`/admin/orders/${encodeURIComponent(
                        order.orderNumber,
                      )}`}
                      className="inline-flex rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-bold text-zinc-700 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-700"
                    >
                      View Order
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {orders.length === 0 ? (
          <div className="px-6 py-10 text-center">
            <p className="text-sm font-bold text-zinc-500">
              No orders found for this customer.
            </p>

            <p className="mt-1 text-xs text-zinc-400">
              Orders are matched by normalized email address.
            </p>
          </div>
        ) : null}
      </section>

      <div className="rounded-2xl border border-orange-100 bg-orange-50/60 p-4 text-xs leading-5 text-zinc-600">
        <strong className="text-zinc-900">Customer matching:</strong> Historical
        orders are associated with this profile using the customer email stored
        when the order was placed. Changing this profile email can therefore
        change which historical orders appear here.
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-[0.12em] text-zinc-400">
        {label}
      </p>

      <p className="mt-3 text-3xl font-black tracking-tight text-zinc-950">
        {value}
      </p>
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
      <h2 className="text-lg font-black text-zinc-950">{title}</h2>

      <p className="mt-1 text-xs leading-5 text-zinc-500">{description}</p>
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
      <span className="text-xs font-bold text-zinc-600">{label}</span>

      {children}
    </label>
  );
}

function TableHeading({ children }: { children: React.ReactNode }) {
  return (
    <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-bold uppercase tracking-[0.1em] text-zinc-400">
      {children}
    </th>
  );
}
