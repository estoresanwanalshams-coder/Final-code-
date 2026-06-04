"use client";

import { useState } from "react";
import { AdminCategoryPanel } from "@/components/AdminCategoryPanel";
import { AdminCustomersPanel } from "@/components/AdminCustomersPanel";
import { AdminOrdersPanel } from "@/components/AdminOrdersPanel";
import { AdminProductPanel } from "@/components/AdminProductPanel";
import { AdminSiteSettingsPanel } from "@/components/AdminSiteSettingsPanel";

type AdminTab = "home" | "orders" | "customers" | "categories" | "products";

const tabs: { id: AdminTab; label: string }[] = [
  { id: "home", label: "Home Page Settings" },
  { id: "orders", label: "Customer Orders" },
  { id: "customers", label: "Customers" },
  { id: "categories", label: "Categories" },
  { id: "products", label: "Products" },
];

export function AdminTabsPanel() {
  const [activeTab, setActiveTab] = useState<AdminTab>("home");

  return (
    <section>
      <div className="sticky top-0 z-40 border-b border-zinc-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap gap-2 px-4 py-3 sm:px-6 lg:px-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-bold transition ${
                activeTab === tab.id
                  ? "bg-zinc-950 text-white"
                  : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "home" ? <AdminSiteSettingsPanel /> : null}
      {activeTab === "orders" ? <AdminOrdersPanel /> : null}
      {activeTab === "customers" ? <AdminCustomersPanel /> : null}
      {activeTab === "categories" ? <AdminCategoryPanel /> : null}
      {activeTab === "products" ? <AdminProductPanel /> : null}
    </section>
  );
}
