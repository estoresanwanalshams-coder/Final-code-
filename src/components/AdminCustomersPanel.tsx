"use client";

import { useEffect, useMemo, useState } from "react";
import {
  fetchSupabaseCustomers,
  type CustomerRecord,
} from "@/lib/supabase-customers";

export function AdminCustomersPanel() {
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"latest" | "oldest">("latest");
  const [latestOnly, setLatestOnly] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(async () => {
      setCustomers(await fetchSupabaseCustomers().catch(() => []));
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const visibleCustomers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    let filtered = customers.filter((customer) => {
      if (!query) {
        return true;
      }

      return (
        customer.fullName.toLowerCase().includes(query) ||
        customer.email.toLowerCase().includes(query) ||
        (customer.phone ?? "").toLowerCase().includes(query)
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
  }, [customers, latestOnly, searchQuery, sortOrder]);

  return (
    <section className="page-shell border-t border-zinc-200">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <p className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
          Customers
        </p>
        <h2 className="mt-3 text-3xl font-bold text-zinc-950">Registered users</h2>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <label className="light-form-field">
            Search customer
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Name, email, phone"
            />
          </label>
          <label className="light-form-field">
            Sort by date
            <select
              value={sortOrder}
              onChange={(event) => setSortOrder(event.target.value as "latest" | "oldest")}
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
              <option value="all">All matching customers</option>
              <option value="latest10">Latest 10 customers</option>
            </select>
          </label>
        </div>
        <div className="mt-7 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 text-zinc-600">
              <tr>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Phone</th>
                <th className="px-4 py-3 font-semibold">Created</th>
              </tr>
            </thead>
            <tbody>
              {visibleCustomers.length === 0 ? (
                <tr>
                  <td className="px-4 py-4 text-zinc-500" colSpan={4}>
                    No customers found for the selected filters.
                  </td>
                </tr>
              ) : null}
              {visibleCustomers.map((customer) => (
                <tr key={customer.id} className="border-t border-zinc-100">
                  <td className="px-4 py-3 font-medium text-zinc-900">
                    {customer.fullName}
                  </td>
                  <td className="px-4 py-3 text-zinc-700">{customer.email}</td>
                  <td className="px-4 py-3 text-zinc-700">{customer.phone || "-"}</td>
                  <td className="px-4 py-3 text-zinc-500">
                    {new Date(customer.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
