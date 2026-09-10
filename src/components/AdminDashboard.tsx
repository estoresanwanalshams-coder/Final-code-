"use client";

import { useEffect, useState } from "react";
import { fetchSupabaseProducts } from "@/lib/supabase-products";
import { fetchSupabaseOrders, type OrderRecord } from "@/lib/supabase-orders";
import { fetchSupabaseCustomers } from "@/lib/supabase-customers";
import { fetchMergedCategories } from "@/lib/supabase-categories";

type DashboardStats = {
  products: number;
  categories: number;
  customers: number;
  orders: number;
  pending: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
};

const emptyStats: DashboardStats = {
  products: 0,
  categories: 0,
  customers: 0,
  orders: 0,
  pending: 0,
  processing: 0,
  shipped: 0,
  delivered: 0,
  cancelled: 0,
};

export function AdminDashboard({
  onNavigate,
}: {
  onNavigate: (tab: "orders" | "customers" | "categories" | "products") => void;
}) {
  const [stats, setStats] = useState<DashboardStats>(emptyStats);
  const [recentOrders, setRecentOrders] = useState<OrderRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [products, orders, customers, categories] = await Promise.all([
          fetchSupabaseProducts(),
          fetchSupabaseOrders(),
          fetchSupabaseCustomers(),
          fetchMergedCategories(),
        ]);

        setStats({
          products: products.length,
          categories: categories.length,
          customers: customers.length,
          orders: orders.length,
          pending: orders.filter((order) => order.status === "pending").length,
          processing: orders.filter((order) => order.status === "processing")
            .length,
          shipped: orders.filter((order) => order.status === "shipped").length,
          delivered: orders.filter((order) => order.status === "delivered")
            .length,
          cancelled: orders.filter((order) => order.status === "cancelled")
            .length,
        });

        setRecentOrders(
          [...orders]
            .sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime(),
            )
            .slice(0, 5),
        );
      } catch (error) {
        const detail =
          error && typeof error === "object" && "message" in error
            ? String(error.message)
            : "Unknown error";

        setMessage(`Unable to load dashboard: ${detail}`);
      } finally {
        setIsLoading(false);
      }
    }

    void loadDashboard();
  }, []);

  return (
    <section className="page-shell">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-zinc-950 px-6 py-7 text-white shadow-xl sm:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-orange-400">
            HM Shop Online
          </p>

          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
            Admin Dashboard
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-300">
            Manage your ecommerce operations, products, customers and orders
            from one place.
          </p>
        </div>

        {message ? (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
            {message}
          </div>
        ) : null}

        <div className="mt-7 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            label="Products"
            value={stats.products}
            description="Catalog products"
            loading={isLoading}
            onClick={() => onNavigate("products")}
          />

          <StatCard
            label="Orders"
            value={stats.orders}
            description="All customer orders"
            loading={isLoading}
            onClick={() => onNavigate("orders")}
          />

          <StatCard
            label="Customers"
            value={stats.customers}
            description="Registered customers"
            loading={isLoading}
            onClick={() => onNavigate("customers")}
          />

          <StatCard
            label="Categories"
            value={stats.categories}
            description="Product categories"
            loading={isLoading}
            onClick={() => onNavigate("categories")}
          />
        </div>

        <div className="mt-7">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
              Order workflow
            </p>
            <h2 className="mt-1 text-2xl font-bold text-zinc-950">
              Order Status Overview
            </h2>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            <OrderStatusCard label="Pending" value={stats.pending} />
            <OrderStatusCard label="Processing" value={stats.processing} />
            <OrderStatusCard label="Shipped" value={stats.shipped} />
            <OrderStatusCard label="Delivered" value={stats.delivered} />
            <OrderStatusCard label="Cancelled" value={stats.cancelled} />
          </div>
        </div>

        <div className="mt-8 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <div className="border-b border-zinc-200 px-5 py-4">
            <p className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
              Latest activity
            </p>
            <h2 className="mt-1 text-xl font-bold text-zinc-950">
              Recent Orders
            </h2>
          </div>

          {isLoading ? (
            <div className="p-6 text-sm text-zinc-500">
              Loading dashboard...
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="p-6 text-sm text-zinc-500">
              No orders available yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-[720px] w-full text-left text-sm">
                <thead className="bg-zinc-50 text-zinc-600">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Order</th>
                    <th className="px-5 py-3 font-semibold">Customer</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3 font-semibold">Total</th>
                    <th className="px-5 py-3 font-semibold">Date</th>
                  </tr>
                </thead>

                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="border-t border-zinc-100">
                      <td className="px-5 py-4 font-bold text-zinc-950">
                        {order.orderNumber}
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-semibold text-zinc-900">
                          {order.fullName}
                        </p>
                        <p className="mt-1 text-xs text-zinc-500">
                          {order.phone}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <span className="inline-flex rounded-full bg-zinc-100 px-3 py-1 text-xs font-bold capitalize text-zinc-700">
                          {order.status}
                        </span>
                      </td>

                      <td className="px-5 py-4 font-semibold text-zinc-900">
                        AED {order.total}
                      </td>

                      <td className="px-5 py-4 text-zinc-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function StatCard({
  label,
  value,
  description,
  loading,
  onClick,
}: {
  label: string;
  value: number;
  description: string;
  loading: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group w-full rounded-2xl border border-zinc-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-orange-300 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-zinc-500">{label}</p>

          <p className="mt-2 text-3xl font-bold text-zinc-950">
            {loading ? "—" : value}
          </p>

          <p className="mt-1 text-xs text-zinc-500">{description}</p>
        </div>

        <span
          aria-hidden="true"
          className="mt-1 text-xl text-zinc-300 transition group-hover:translate-x-1 group-hover:text-orange-500"
        >
          →
        </span>
      </div>
    </button>
  );
}

function OrderStatusCard({ label, value }: { label: string; value: number }) {
  return (
    <article className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
      <p className="text-sm font-semibold text-zinc-600">{label}</p>
      <p className="mt-2 text-2xl font-bold text-zinc-950">{value}</p>
    </article>
  );
}
