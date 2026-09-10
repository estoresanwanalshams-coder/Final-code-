"use client";

import { useRouter } from "next/navigation";
import { AdminDashboard } from "@/components/AdminDashboard";

export default function AdminPage() {
  const router = useRouter();

  return (
    <AdminDashboard
      onNavigate={(tab) => {
        const routes = {
          dashboard: "/admin",
          orders: "/admin/orders",
          customers: "/admin/customers",
          products: "/admin/products",
          categories: "/admin/categories",
        } as const;

        router.push(routes[tab]);
      }}
    />
  );
}