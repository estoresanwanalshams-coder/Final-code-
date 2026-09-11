"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  fetchSupabaseOrders,
  type OrderRecord,
  type OrderStatus,
} from "@/lib/supabase-orders";

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

export function AdminOrdersPanel() {
  const [orders, setOrders] =
    useState<OrderRecord[]>([]);

  const [message, setMessage] =
    useState("");

  const [searchQuery, setSearchQuery] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState<"all" | OrderStatus>(
      "all",
    );

  const [sortOrder, setSortOrder] =
    useState<"latest" | "oldest">(
      "latest",
    );

  const [isLoading, setIsLoading] =
    useState(true);

  const loadOrders =
    useCallback(async () => {
      setIsLoading(true);

      try {
        const data =
          await fetchSupabaseOrders();

        setOrders(data);
        setMessage("");
      } catch (error) {
        const detail =
          error &&
          typeof error === "object" &&
          "message" in error
            ? String(error.message)
            : "Unknown error";

        setOrders([]);

        setMessage(
          `Unable to load orders. ${detail}`,
        );
      } finally {
        setIsLoading(false);
      }
    }, []);

  useEffect(() => {
    const timer =
      window.setTimeout(() => {
        void loadOrders();
      }, 0);

    return () =>
      window.clearTimeout(timer);
  }, [loadOrders]);

  const stats = useMemo(
    () => ({
      total: orders.length,

      pending: orders.filter(
        (order) =>
          order.status === "pending",
      ).length,

      processing: orders.filter(
        (order) =>
          order.status ===
          "processing",
      ).length,

      delivered: orders.filter(
        (order) =>
          order.status ===
          "delivered",
      ).length,
    }),
    [orders],
  );

  const visibleOrders =
    useMemo(() => {
      const query =
        searchQuery
          .trim()
          .toLowerCase();

      return [...orders]
        .filter((order) => {
          if (
            statusFilter !== "all" &&
            order.status !==
              statusFilter
          ) {
            return false;
          }

          if (!query) {
            return true;
          }

          return (
            order.orderNumber
              .toLowerCase()
              .includes(query) ||
            order.fullName
              .toLowerCase()
              .includes(query) ||
            order.email
              .toLowerCase()
              .includes(query) ||
            order.phone
              .toLowerCase()
              .includes(query)
          );
        })
        .sort((a, b) => {
          const aTime =
            new Date(
              a.createdAt,
            ).getTime();

          const bTime =
            new Date(
              b.createdAt,
            ).getTime();

          return sortOrder ===
            "latest"
            ? bTime - aTime
            : aTime - bTime;
        });
    }, [
      orders,
      searchQuery,
      sortOrder,
      statusFilter,
    ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-500">
            Orders
          </p>

          <h1 className="mt-2 text-3xl font-black tracking-tight text-zinc-950">
            Customer Orders
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
            Review, manage and fulfil HM
            Shop Online customer orders.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            void loadOrders()
          }
          disabled={isLoading}
          className="rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-bold text-zinc-700 shadow-sm transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading
            ? "Refreshing..."
            : "Refresh Orders"}
        </button>
      </div>

      {message ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {message}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Orders"
          value={stats.total}
        />

        <StatCard
          label="Pending"
          value={stats.pending}
        />

        <StatCard
          label="Processing"
          value={stats.processing}
        />

        <StatCard
          label="Delivered"
          value={stats.delivered}
        />
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_190px]">
          <input
            value={searchQuery}
            onChange={(event) =>
              setSearchQuery(
                event.target.value,
              )
            }
            placeholder="Search order number, customer, email or phone..."
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-medium text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-orange-300 focus:bg-white focus:ring-4 focus:ring-orange-100"
          />

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value as
                  | "all"
                  | OrderStatus,
              )
            }
            className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-bold text-zinc-700 outline-none focus:border-orange-300 focus:ring-4 focus:ring-orange-100"
          >
            <option value="all">
              All statuses
            </option>

            {statuses.map(
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

          <select
            value={sortOrder}
            onChange={(event) =>
              setSortOrder(
                event.target.value as
                  | "latest"
                  | "oldest",
              )
            }
            className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-bold text-zinc-700 outline-none focus:border-orange-300 focus:ring-4 focus:ring-orange-100"
          >
            <option value="latest">
              Latest first
            </option>

            <option value="oldest">
              Oldest first
            </option>
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="border-b border-zinc-200 bg-zinc-50">
              <tr>
                <TableHeading>
                  Order
                </TableHeading>

                <TableHeading>
                  Customer
                </TableHeading>

                <TableHeading>
                  Items
                </TableHeading>

                <TableHeading>
                  Total
                </TableHeading>

                <TableHeading>
                  Date
                </TableHeading>

                <TableHeading>
                  Status
                </TableHeading>

                <TableHeading>
                  Action
                </TableHeading>
              </tr>
            </thead>

            <tbody className="divide-y divide-zinc-100">
              {visibleOrders.map(
                (order) => (
                  <tr
                    key={order.id}
                    className="transition hover:bg-zinc-50/80"
                  >
                    <td className="whitespace-nowrap px-5 py-4">
                      <Link
                        href={`/admin/orders/${encodeURIComponent(
                          order.orderNumber,
                        )}`}
                        className="text-sm font-black text-zinc-950 transition hover:text-orange-600"
                      >
                        {
                          order.orderNumber
                        }
                      </Link>
                    </td>

                    <td className="px-5 py-4">
                      <p className="text-sm font-bold text-zinc-900">
                        {
                          order.fullName
                        }
                      </p>

                      <p className="mt-1 text-xs text-zinc-500">
                        {order.phone}
                      </p>

                      <p className="mt-0.5 max-w-[240px] truncate text-xs text-zinc-400">
                        {order.email}
                      </p>
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-zinc-600">
                      {order.items.reduce(
                        (
                          total,
                          item,
                        ) =>
                          total +
                          item.quantity,
                        0,
                      )}
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-sm font-black text-zinc-900">
                      {formatMoney(
                        order.total,
                      )}
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-xs font-semibold text-zinc-500">
                      {formatDate(
                        order.createdAt,
                      )}
                    </td>

                    <td className="whitespace-nowrap px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset ${
                          statusClasses[
                            order
                              .status
                          ]
                        }`}
                      >
                        {
                          statusLabels[
                            order
                              .status
                          ]
                        }
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-5 py-4">
                      <Link
                        href={`/admin/orders/${encodeURIComponent(
                          order.orderNumber,
                        )}`}
                        className="inline-flex rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-bold text-zinc-700 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-700"
                      >
                        View / Manage
                      </Link>
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </div>

        {!isLoading &&
        visibleOrders.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm font-bold text-zinc-500">
              No orders found.
            </p>

            <p className="mt-1 text-xs text-zinc-400">
              Try changing your search
              or filters.
            </p>
          </div>
        ) : null}

        {isLoading ? (
          <div className="px-6 py-12 text-center text-sm font-semibold text-zinc-400">
            Loading orders...
          </div>
        ) : null}

        {!isLoading &&
        visibleOrders.length > 0 ? (
          <div className="border-t border-zinc-100 bg-zinc-50 px-5 py-3 text-xs font-semibold text-zinc-500">
            Showing{" "}
            {visibleOrders.length} of{" "}
            {orders.length} orders
          </div>
        ) : null}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
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

function TableHeading({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-bold uppercase tracking-[0.1em] text-zinc-400">
      {children}
    </th>
  );
}