"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  backfillCustomersFromAuth,
  createSupabaseCustomer,
  deleteSupabaseCustomer,
  fetchSupabaseCustomers,
  updateSupabaseCustomer,
  type CustomerRecord,
} from "@/lib/supabase-customers";
import { isValidPhoneNumber, normalizePhoneInput } from "@/lib/phone";

const emptyForm = {
  fullName: "",
  email: "",
  phone: "",
};

export function AdminCustomersPanel() {
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"latest" | "oldest">("latest");
  const [latestOnly, setLatestOnly] = useState(false);
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [isSyncing, setIsSyncing] = useState(false);

  const loadCustomers = useCallback(async () => {
    try {
      const rows = await fetchSupabaseCustomers();
      setCustomers(rows);
      setMessage("");
    } catch (error) {
      const detail =
        error && typeof error === "object" && "message" in error
          ? String(error.message)
          : "Unknown error";
      setMessage(
        `Unable to load customers. Run supabase/fix-admin-access.sql in Supabase SQL Editor, then click "Sync Auth Users". Error: ${detail}`,
      );
      setCustomers([]);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadCustomers();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadCustomers]);

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

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
  }

  function startEdit(customer: CustomerRecord) {
    setEditingId(customer.id);
    setForm({
      fullName: customer.fullName,
      email: customer.email,
      phone: customer.phone,
    });
  }

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.fullName.trim() || !form.email.trim()) {
      setMessage("Name and email are required.");
      return;
    }

    if (!isValidPhoneNumber(form.phone)) {
      setMessage("Please enter a valid phone number (7 to 15 digits).");
      return;
    }

    try {
      if (editingId) {
        await updateSupabaseCustomer(editingId, form);
        setMessage("Customer updated.");
      } else {
        await createSupabaseCustomer(form);
        setMessage("Customer created.");
      }

      resetForm();
      await loadCustomers();
    } catch (error) {
      const detail =
        error && typeof error === "object" && "message" in error
          ? String(error.message)
          : "Unknown error";
      setMessage(`Unable to save customer: ${detail}`);
    }
  }

  async function handleSyncFromAuth() {
    setIsSyncing(true);
    try {
      const count = await backfillCustomersFromAuth();
      await loadCustomers();
      setMessage(`Synced ${count} customer record(s) from registered auth users.`);
    } catch (error) {
      const detail =
        error && typeof error === "object" && "message" in error
          ? String(error.message)
          : "Unknown error";
      setMessage(
        `Unable to sync customers. Run supabase/fix-admin-access.sql first. ${detail}`,
      );
    } finally {
      setIsSyncing(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this customer record?")) {
      return;
    }

    try {
      await deleteSupabaseCustomer(id);
      if (editingId === id) {
        resetForm();
      }
      await loadCustomers();
      setMessage("Customer deleted.");
    } catch {
      setMessage("Unable to delete customer.");
    }
  }

  return (
    <section className="page-shell border-t border-zinc-200">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <p className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
          Customers
        </p>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-3xl font-bold text-zinc-950">Registered users</h2>
          <button
            type="button"
            onClick={() => void handleSyncFromAuth()}
            disabled={isSyncing}
            className="btn-soft disabled:opacity-60"
          >
            {isSyncing ? "Syncing..." : "Sync Auth Users"}
          </button>
        </div>
        <p className="mt-2 text-sm text-zinc-600">
          Total customers loaded: {customers.length}
        </p>

        {message ? (
          <p className="mt-4 rounded-xl border border-zinc-200 bg-white p-4 text-sm font-semibold text-zinc-700">
            {message}
          </p>
        ) : null}

        <form
          onSubmit={handleSave}
          className="mt-6 grid gap-3 rounded-xl border border-zinc-200 bg-white p-5 md:grid-cols-3"
        >
          <label className="light-form-field">
            Full name
            <input
              value={form.fullName}
              onChange={(event) =>
                setForm((current) => ({ ...current, fullName: event.target.value }))
              }
              required
            />
          </label>
          <label className="light-form-field">
            Email
            <input
              type="email"
              value={form.email}
              onChange={(event) =>
                setForm((current) => ({ ...current, email: event.target.value }))
              }
              required
            />
          </label>
          <label className="light-form-field">
            Phone
            <input
              type="tel"
              value={form.phone}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  phone: normalizePhoneInput(event.target.value),
                }))
              }
              required
            />
          </label>
          <div className="flex flex-wrap gap-2 md:col-span-3">
            <button type="submit" className="btn-soft">
              {editingId ? "Update customer" : "Add customer"}
            </button>
            {editingId ? (
              <button type="button" onClick={resetForm} className="btn-soft">
                Cancel edit
              </button>
            ) : null}
          </div>
        </form>

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
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleCustomers.length === 0 ? (
                <tr>
                  <td className="px-4 py-4 text-zinc-500" colSpan={5}>
                    No customers found. Add customers from register or use Add customer
                    above.
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
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(customer)}
                        className="rounded border border-zinc-300 px-3 py-1 text-xs font-semibold"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDelete(customer.id)}
                        className="rounded border border-red-300 px-3 py-1 text-xs font-semibold text-red-700"
                      >
                        Delete
                      </button>
                    </div>
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
