"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  backfillCustomersFromAuth,
  fetchSupabaseCustomers,
  type CustomerRecord,
} from "@/lib/supabase-customers";

import {
  fetchSupabaseOrders,
  type OrderRecord,
} from "@/lib/supabase-orders";

type CustomerMetrics = {
  orders: OrderRecord[];
  orderCount: number;
  totalSpent: number;
  lastOrder: OrderRecord | null;
};

function normalizeEmail(
  email: string,
) {
  return email
    .trim()
    .toLowerCase();
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
    },
  ).format(date);
}

export function AdminCustomersPanel() {
  const [customers, setCustomers] =
    useState<CustomerRecord[]>([]);

  const [orders, setOrders] =
    useState<OrderRecord[]>([]);

  const [searchQuery, setSearchQuery] =
    useState("");

  const [sortOrder, setSortOrder] =
    useState<
      | "latest"
      | "oldest"
      | "orders"
      | "spent"
    >("latest");

  const [message, setMessage] =
    useState("");

  const [isLoading, setIsLoading] =
    useState(true);

  const [isSyncing, setIsSyncing] =
    useState(false);

  const loadData =
    useCallback(async () => {
      setIsLoading(true);

      try {
        const [
          customerRows,
          orderRows,
        ] = await Promise.all([
          fetchSupabaseCustomers(),
          fetchSupabaseOrders(),
        ]);

        setCustomers(
          customerRows,
        );

        setOrders(orderRows);

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

        setCustomers([]);
        setOrders([]);

        setMessage(
          `Unable to load customers. ${detail}`,
        );
      } finally {
        setIsLoading(false);
      }
    }, []);

  useEffect(() => {
    const timer =
      window.setTimeout(() => {
        void loadData();
      }, 0);

    return () =>
      window.clearTimeout(
        timer,
      );
  }, [loadData]);

  const ordersByEmail =
    useMemo(() => {
      const map = new Map<
        string,
        OrderRecord[]
      >();

      orders.forEach((order) => {
        const email =
          normalizeEmail(
            order.email,
          );

        const existing =
          map.get(email) ?? [];

        existing.push(order);

        map.set(
          email,
          existing,
        );
      });

      return map;
    }, [orders]);

  const customerMetrics =
    useMemo(() => {
      const map = new Map<
        string,
        CustomerMetrics
      >();

      customers.forEach(
        (customer) => {
          const matchedOrders =
            [
              ...(
                ordersByEmail.get(
                  normalizeEmail(
                    customer.email,
                  ),
                ) ?? []
              ),
            ].sort(
              (a, b) =>
                new Date(
                  b.createdAt,
                ).getTime() -
                new Date(
                  a.createdAt,
                ).getTime(),
            );

          map.set(
            customer.id,
            {
              orders:
                matchedOrders,

              orderCount:
                matchedOrders.length,

              totalSpent:
                matchedOrders.reduce(
                  (
                    total,
                    order,
                  ) =>
                    total +
                    order.total,
                  0,
                ),

              lastOrder:
                matchedOrders[0] ??
                null,
            },
          );
        },
      );

      return map;
    }, [
      customers,
      ordersByEmail,
    ]);

  const registeredCustomers =
    useMemo(
      () =>
        customers.filter(
          (customer) =>
            Boolean(
              customer.authUserId,
            ),
        ).length,
      [customers],
    );

  const customersWithOrders =
    useMemo(
      () =>
        customers.filter(
          (customer) =>
            (
              customerMetrics.get(
                customer.id,
              )?.orderCount ??
              0
            ) > 0,
        ).length,
      [
        customers,
        customerMetrics,
      ],
    );

  const registeredOrderCount =
    useMemo(
      () =>
        customers.reduce(
          (total, customer) =>
            total +
            (
              customerMetrics.get(
                customer.id,
              )?.orderCount ??
              0
            ),
          0,
        ),
      [
        customers,
        customerMetrics,
      ],
    );

  const registeredRevenue =
    useMemo(
      () =>
        customers.reduce(
          (total, customer) =>
            total +
            (
              customerMetrics.get(
                customer.id,
              )?.totalSpent ??
              0
            ),
          0,
        ),
      [
        customers,
        customerMetrics,
      ],
    );

  const visibleCustomers =
    useMemo(() => {
      const query =
        searchQuery
          .trim()
          .toLowerCase();

      return [...customers]
        .filter((customer) => {
          if (!query) {
            return true;
          }

          return (
            customer.fullName
              .toLowerCase()
              .includes(query) ||
            customer.email
              .toLowerCase()
              .includes(query) ||
            customer.phone
              .toLowerCase()
              .includes(query)
          );
        })
        .sort((a, b) => {
          const aMetrics =
            customerMetrics.get(
              a.id,
            );

          const bMetrics =
            customerMetrics.get(
              b.id,
            );

          if (
            sortOrder ===
            "orders"
          ) {
            return (
              (bMetrics?.orderCount ??
                0) -
              (aMetrics?.orderCount ??
                0)
            );
          }

          if (
            sortOrder === "spent"
          ) {
            return (
              (bMetrics?.totalSpent ??
                0) -
              (aMetrics?.totalSpent ??
                0)
            );
          }

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
      customers,
      customerMetrics,
      searchQuery,
      sortOrder,
    ]);

  async function handleSync() {
    setIsSyncing(true);
    setMessage("");

    try {
      const count =
        await backfillCustomersFromAuth();

      await loadData();

      setMessage(
        `Synced ${count} customer record(s) from registered auth users.`,
      );
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
        `Unable to sync customers. ${detail}`,
      );
    } finally {
      setIsSyncing(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-500">
            Customers
          </p>

          <h1 className="mt-2 text-3xl font-black tracking-tight text-zinc-950">
            Customer Management
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
            Understand registered
            customers and their HM Shop
            Online order activity.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() =>
              void loadData()
            }
            disabled={isLoading}
            className="rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-bold text-zinc-700 shadow-sm transition hover:bg-zinc-50 disabled:opacity-60"
          >
            {isLoading
              ? "Refreshing..."
              : "Refresh"}
          </button>

          <button
            type="button"
            onClick={() =>
              void handleSync()
            }
            disabled={isSyncing}
            className="rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-black text-white shadow-sm transition hover:bg-orange-600 disabled:opacity-60"
          >
            {isSyncing
              ? "Syncing..."
              : "Sync Auth Users"}
          </button>
        </div>
      </div>

      {message ? (
        <div className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold text-zinc-700 shadow-sm">
          {message}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Registered Customers"
          value={registeredCustomers}
        />

        <StatCard
          label="Customers With Orders"
          value={customersWithOrders}
        />

        <StatCard
          label="Registered Orders"
          value={registeredOrderCount}
        />

        <StatCard
          label="Registered Revenue"
          value={formatMoney(
            registeredRevenue,
          )}
        />
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_240px]">
          <input
            value={searchQuery}
            onChange={(event) =>
              setSearchQuery(
                event.target.value,
              )
            }
            placeholder="Search name, email or phone..."
            className="admin-order-input"
          />

          <select
            value={sortOrder}
            onChange={(event) =>
              setSortOrder(
                event.target.value as
                  | "latest"
                  | "oldest"
                  | "orders"
                  | "spent",
              )
            }
            className="admin-order-input"
          >
            <option value="latest">
              Latest customers
            </option>

            <option value="oldest">
              Oldest customers
            </option>

            <option value="orders">
              Most orders
            </option>

            <option value="spent">
              Highest spend
            </option>
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-[900px] w-full">
            <thead className="border-b border-zinc-200 bg-zinc-50">
              <tr>
                <TableHeading>
                  Customer
                </TableHeading>

                <TableHeading>
                  Type
                </TableHeading>

                <TableHeading>
                  Orders
                </TableHeading>

                <TableHeading>
                  Total Spent
                </TableHeading>

                <TableHeading>
                  Last Order
                </TableHeading>

                <TableHeading>
                  Customer Since
                </TableHeading>

                <TableHeading>
                  Action
                </TableHeading>
              </tr>
            </thead>

            <tbody className="divide-y divide-zinc-100">
              {visibleCustomers.map(
                (customer) => {
                  const metrics =
                    customerMetrics.get(
                      customer.id,
                    );

                  return (
                    <tr
                      key={
                        customer.id
                      }
                      className="transition hover:bg-zinc-50/80"
                    >
                      <td className="px-5 py-4">
                        <p className="text-sm font-black text-zinc-950">
                          {
                            customer.fullName
                          }
                        </p>

                        <p className="mt-1 text-xs text-zinc-500">
                          {
                            customer.email
                          }
                        </p>

                        <p className="mt-0.5 text-xs text-zinc-400">
                          {customer.phone ||
                            "No phone"}
                        </p>
                      </td>

                      <td className="whitespace-nowrap px-5 py-4">
                        <span
                          className={
                            customer.authUserId
                              ? "inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 ring-1 ring-inset ring-emerald-600/10"
                              : "inline-flex rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-bold text-zinc-600 ring-1 ring-inset ring-zinc-500/10"
                          }
                        >
                          {customer.authUserId
                            ? "Registered"
                            : "Manual"}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-sm font-black text-zinc-900">
                        {metrics?.orderCount ??
                          0}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-sm font-black text-zinc-900">
                        {formatMoney(
                          metrics?.totalSpent ??
                            0,
                        )}
                      </td>

                      <td className="px-5 py-4">
                        {metrics?.lastOrder ? (
                          <>
                            <Link
                              href={`/admin/orders/${encodeURIComponent(
                                metrics
                                  .lastOrder
                                  .orderNumber,
                              )}`}
                              className="text-sm font-bold text-zinc-900 transition hover:text-orange-600"
                            >
                              {
                                metrics
                                  .lastOrder
                                  .orderNumber
                              }
                            </Link>

                            <p className="mt-1 text-xs capitalize text-zinc-500">
                              {
                                metrics
                                  .lastOrder
                                  .status
                              }
                            </p>
                          </>
                        ) : (
                          <span className="text-sm text-zinc-400">
                            No orders
                          </span>
                        )}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-xs font-semibold text-zinc-500">
                        {formatDate(
                          customer.createdAt,
                        )}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4">
                        <Link
                          href={`/admin/customers/${encodeURIComponent(
                            customer.id,
                          )}`}
                          className="inline-flex rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-bold text-zinc-700 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-700"
                        >
                          View / Manage
                        </Link>
                      </td>
                    </tr>
                  );
                },
              )}
            </tbody>
          </table>
        </div>

        {isLoading ? (
          <div className="px-6 py-12 text-center text-sm font-semibold text-zinc-400">
            Loading customers...
          </div>
        ) : null}

        {!isLoading &&
        visibleCustomers.length ===
          0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm font-bold text-zinc-500">
              No customers found.
            </p>

            <p className="mt-1 text-xs text-zinc-400">
              Try changing your search.
            </p>
          </div>
        ) : null}

        {!isLoading &&
        visibleCustomers.length >
          0 ? (
          <div className="border-t border-zinc-100 bg-zinc-50 px-5 py-3 text-xs font-semibold text-zinc-500">
            Showing{" "}
            {
              visibleCustomers.length
            }{" "}
            of {customers.length}{" "}
            customer profiles
          </div>
        ) : null}
      </div>

      <div className="rounded-2xl border border-orange-100 bg-orange-50/60 p-4 text-xs leading-5 text-zinc-600">
        <strong className="text-zinc-900">
          About these figures:
        </strong>{" "}
        Order activity is matched to
        customer profiles using the
        normalized email address.
        Guest COD buyers who never
        registered are not counted as
        registered customers here.
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
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