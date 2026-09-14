"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { isAdminEmail } from "@/lib/auth-role";
import {
  fetchCustomerProfileByAuthUserId,
  type CustomerRecord,
} from "@/lib/supabase-customers";
import {
  fetchSupabaseOrdersByEmail,
  type OrderRecord,
  type OrderStatus,
} from "@/lib/supabase-orders";
import { supabase } from "@/lib/supabase";

type SessionUser = {
  id: string;
  email: string;
  fullName: string;
  phone: string;
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
  const [profile, setProfile] = useState<CustomerRecord | null>(null);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
        fullName:
          (
            sessionUser.user_metadata?.full_name as string | undefined
          )?.trim() ?? "",
        phone:
          (sessionUser.user_metadata?.phone as string | undefined)?.trim() ??
          "",
      };
      setUser(nextUser);

      const [nextProfile, nextOrders] = await Promise.all([
        fetchCustomerProfileByAuthUserId(nextUser.id).catch(() => null),
        fetchSupabaseOrdersByEmail(nextUser.email).catch(() => []),
      ]);

      setProfile(nextProfile);
      setOrders(nextOrders);
      setIsLoading(false);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [router]);

  const orderValue = useMemo(
    () =>
      orders
        .filter((order) => order.status !== "cancelled")
        .reduce((total, order) => total + order.total, 0),
    [orders],
  );

  const displayName =
  profile?.fullName?.trim() ||
  user?.fullName ||
  orders[0]?.fullName?.trim() ||
  "Customer";

const displayPhone =
  profile?.phone?.trim() ||
  user?.phone ||
  orders[0]?.phone?.trim() ||
  "";

  async function handleLogout() {
  await supabase.auth.signOut();
  router.replace("/login");
  router.refresh();
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
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
                My Account
              </p>

              <h1 className="mt-2 text-2xl font-bold text-zinc-950">
                {displayName}
              </h1>

              <div className="mt-4 space-y-1 text-sm text-zinc-600">
                <p>{user.email}</p>
                {displayPhone ? <p>{displayPhone}</p> : null}
              </div>
            </div>

            <button
              type="button"
              onClick={() => void handleLogout()}
              className="btn-soft"
            >
              Logout
            </button>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-zinc-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Orders
              </p>
              <p className="mt-1 text-2xl font-bold text-zinc-950">
                {orders.length}
              </p>
            </div>

            <div className="rounded-xl bg-zinc-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Order Value
              </p>
              <p className="mt-1 text-2xl font-bold text-zinc-950">
                AED {orderValue.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 space-y-4">
          <div>
            <h2 className="text-xl font-bold text-zinc-950">Order History</h2>
            <p className="mt-1 text-sm text-zinc-600">
              View your previous HM Shop Online orders and current status.
            </p>
          </div>

          {orders.length === 0 ? (
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-center">
              <p className="font-semibold text-zinc-950">No orders yet</p>
              <p className="mt-1 text-sm text-zinc-600">
                Your orders will appear here after you place them.
              </p>
              <Link href="/products" className="btn-soft mt-5">
                Browse Products
              </Link>
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
                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${statusStyles[order.status]}`}
                  >
                    {order.status}
                  </span>

                  <Link
                    href={`/track-order?order=${encodeURIComponent(order.orderNumber)}`}
                    className="text-sm font-semibold text-hm-orange hover:text-hm-orange-hover"
                  >
                    Track Order
                  </Link>
                </div>
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
