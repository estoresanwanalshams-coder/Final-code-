"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { isAdminEmail } from "@/lib/auth-role";
import {
  fetchSupabaseOrdersByEmail,
  type OrderRecord,
  type OrderStatus,
} from "@/lib/supabase-orders";
import { supabase } from "@/lib/supabase";

type SessionUser = {
  id: string;
  email: string;
};

const statusStyles: Record<OrderStatus, string> = {
  pending: "bg-amber-100 text-amber-700",
  processing: "bg-blue-100 text-blue-700",
  shipped: "bg-violet-100 text-violet-700",
  delivered: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(async () => {
      const {
        data: { user: sessionUser },
      } = await supabase.auth.getUser();

      if (!sessionUser?.email) {
        setIsLoading(false);
        return;
      }

      if (isAdminEmail(sessionUser.email)) {
        router.replace("/admin");
        return;
      }

      const nextUser: SessionUser = {
        id: sessionUser.id,
        email: sessionUser.email,
      };
      setUser(nextUser);

      const nextOrders = await fetchSupabaseOrdersByEmail(nextUser.email).catch(() => []);
      setOrders(nextOrders);
      setIsLoading(false);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [router]);

  const totalSpent = useMemo(
    () => orders.reduce((total, order) => total + order.total, 0),
    [orders],
  );

  async function handleLogout() {
    await supabase.auth.signOut();
    setMessage("Logged out successfully.");
    setUser(null);
    setOrders([]);
  }

  if (isLoading) {
    return (
      <section className="page-shell">
        <div className="mx-auto max-w-7xl px-4 py-14 text-center text-zinc-600">
          Loading profile...
        </div>
      </section>
    );
  }

  if (!user) {
    return (
      <section className="page-shell">
        <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 text-center">
          <h1 className="text-3xl font-bold text-zinc-950">Login required</h1>
          <p className="mt-3 text-zinc-600">
            Please login to view your profile and order status.
          </p>
          <Link href="/login" className="btn-soft mt-6">
            Go to Login
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="page-shell">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
                Customer Profile
              </p>
              <h1 className="mt-2 text-2xl font-bold text-zinc-950">{user.email}</h1>
              <p className="mt-1 text-sm text-zinc-600">
                Orders: {orders.length} | Total spent: AED {totalSpent}
              </p>
            </div>
            <button type="button" onClick={() => void handleLogout()} className="btn-soft">
              Logout
            </button>
          </div>
          {message ? (
            <p className="mt-3 rounded-lg bg-zinc-100 px-3 py-2 text-sm text-zinc-700">
              {message}
            </p>
          ) : null}
        </div>

        <div className="mt-8 space-y-4">
          {orders.length === 0 ? (
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-zinc-600">
              You have not placed any order yet.
            </div>
          ) : null}
          {orders.map((order) => (
            <article
              key={order.id}
              className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
                    {order.orderNumber}
                  </p>
                  <p className="mt-1 text-sm text-zinc-600">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${statusStyles[order.status]}`}
                >
                  {order.status}
                </span>
              </div>
              <ul className="mt-4 space-y-2">
                {order.items.map((item) => (
                  <li
                    key={`${order.id}-${item.product.slug}`}
                    className="flex items-center justify-between rounded-lg bg-zinc-50 px-3 py-2 text-sm"
                  >
                    <span>
                      {item.product.name} x {item.quantity}
                    </span>
                    <span className="font-semibold">
                      AED {item.product.price * item.quantity}
                    </span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
