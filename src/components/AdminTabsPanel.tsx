"use client";

import { useState } from "react";
import { AdminCategoryPanel } from "@/components/AdminCategoryPanel";
import { AdminCustomersPanel } from "@/components/AdminCustomersPanel";
import { AdminDashboard } from "@/components/AdminDashboard";
import { AdminOrdersPanel } from "@/components/AdminOrdersPanel";
import { AdminProductPanel } from "@/components/AdminProductPanel";
import { AdminSiteSettingsPanel } from "@/components/AdminSiteSettingsPanel";

type AdminTab =
  | "dashboard"
  | "home"
  | "orders"
  | "customers"
  | "categories"
  | "products";

const tabs: { id: AdminTab; label: string }[] = [
  { id: "dashboard", label: "Dashboard" },
  { id: "orders", label: "Orders" },
  { id: "products", label: "Products" },
  { id: "categories", label: "Categories" },
  { id: "customers", label: "Customers" },
  { id: "home", label: "Homepage" },
];

export function AdminTabsPanel() {
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");

  return (
    <section>
      <div className="sticky top-0 z-40 border-b border-zinc-200 bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`shrink-0 rounded-lg px-4 py-2.5 text-sm font-bold transition ${
                  activeTab === tab.id
                    ? "bg-zinc-950 text-white shadow-sm"
                    : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 hover:text-zinc-950"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {activeTab === "dashboard" ? (
        <AdminDashboard onNavigate={setActiveTab} />
      ) : null}
      {activeTab === "home" ? <AdminSiteSettingsPanel /> : null}
      {activeTab === "orders" ? <AdminOrdersPanel /> : null}
      {activeTab === "customers" ? <AdminCustomersPanel /> : null}
      {activeTab === "categories" ? <AdminCategoryPanel /> : null}
      {activeTab === "products" ? <AdminProductPanel /> : null}
    </section>
  );
}
