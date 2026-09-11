"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

type NavigationItem = {
  href: string;
  label: string;
  shortLabel: string;
  description: string;
};

const navigationGroups: {
  label: string;
  items: NavigationItem[];
}[] = [
  {
    label: "Overview",
    items: [
      {
        href: "/admin",
        label: "Dashboard",
        shortLabel: "D",
        description: "Store overview",
      },
    ],
  },
  {
    label: "Sales",
    items: [
      {
        href: "/admin/orders",
        label: "Orders",
        shortLabel: "O",
        description: "Manage customer orders",
      },
      {
        href: "/admin/customers",
        label: "Customers",
        shortLabel: "C",
        description: "Customer accounts",
      },
    ],
  },
  {
    label: "Catalog",
    items: [
      {
        href: "/admin/products",
        label: "Products",
        shortLabel: "P",
        description: "Manage your catalog",
      },
      {
        href: "/admin/categories",
        label: "Categories",
        shortLabel: "C",
        description: "Organize products",
      },
    ],
  },
  {
    label: "Store",
    items: [
      {
        href: "/admin/homepage",
        label: "Homepage",
        shortLabel: "H",
        description: "Homepage merchandising",
      },
    ],
  },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  function isItemActive(href: string) {
    if (href === "/admin") {
      return pathname === "/admin";
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  }

  const activeItem = navigationGroups
    .flatMap((group) => group.items)
    .find((item) => isItemActive(item.href));

  function renderSidebar(isMobile = false) {
    const collapsed = !isMobile && sidebarCollapsed;

    return (
      <div className="flex h-full flex-col bg-[#f7f7f8]">
        <div
          className={`border-b border-zinc-200 ${
            collapsed ? "px-3 py-5" : "px-5 py-5"
          }`}
        >
          {!collapsed ? (
            <>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-zinc-400">
                Administration
              </p>

              <p className="mt-1.5 text-base font-bold text-zinc-900">
                Store Management
              </p>
            </>
          ) : (
            <div className="flex justify-center">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-sm font-extrabold text-orange-600">
                HM
              </div>
            </div>
          )}
        </div>

        <nav
          className={`flex-1 overflow-y-auto py-5 ${
            collapsed ? "px-2" : "px-3"
          }`}
        >
          <div className="space-y-7">
            {navigationGroups.map((group) => (
              <div key={group.label}>
                {!collapsed ? (
                  <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-400">
                    {group.label}
                  </p>
                ) : null}

                <div className="space-y-1">
                  {group.items.map((item) => {
                    const active = isItemActive(item.href);

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        title={collapsed ? item.label : undefined}
                        className={`group flex w-full items-center rounded-xl transition ${
                          collapsed
                            ? "justify-center px-2 py-2.5"
                            : "gap-3 px-3 py-3 text-left"
                        } ${
                          active
                            ? "bg-[#fff3e7] text-orange-700"
                            : "text-zinc-600 hover:bg-white hover:text-zinc-950"
                        }`}
                      >
                        <span
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-extrabold ${
                            active
                              ? "bg-orange-500 text-white"
                              : "bg-zinc-200 text-zinc-600 group-hover:bg-zinc-100"
                          }`}
                        >
                          {item.shortLabel}
                        </span>

                        {!collapsed ? (
                          <span className="min-w-0">
                            <span className="block text-sm font-bold">
                              {item.label}
                            </span>

                            <span
                              className={`mt-0.5 block truncate text-xs ${
                                active ? "text-orange-600/70" : "text-zinc-400"
                              }`}
                            >
                              {item.description}
                            </span>
                          </span>
                        ) : null}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </nav>

        <div className="border-t border-zinc-200 p-3">
          <Link
            href="/"
            target="_blank"
            title={collapsed ? "View Storefront" : undefined}
            className={`flex items-center rounded-xl border border-zinc-200 bg-white text-sm font-bold text-zinc-700 transition hover:border-orange-300 hover:text-orange-600 ${
              collapsed
                ? "justify-center px-2 py-3"
                : "justify-between px-4 py-3"
            }`}
          >
            {collapsed ? (
              <span>↗</span>
            ) : (
              <>
                <span>View Storefront</span>
                <span>↗</span>
              </>
            )}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <section className="min-h-[calc(100vh-76px)] bg-[#fafafa]">
      <div className="sticky top-0 z-40 border-b border-zinc-200 bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              Admin
            </p>

            <p className="text-base font-bold text-zinc-950">
              {activeItem?.label ?? "Admin"}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 bg-white text-xl font-bold text-zinc-700 shadow-sm"
          >
            ☰
          </button>
        </div>
      </div>

      <div
        className={`lg:grid ${
          sidebarCollapsed
            ? "lg:grid-cols-[84px_minmax(0,1fr)]"
            : "lg:grid-cols-[240px_minmax(0,1fr)]"
        }`}
      >
        <aside className="relative hidden border-r border-zinc-200 bg-[#f7f7f8] lg:block">
          <div className="sticky top-0 h-screen">
            {renderSidebar()}

            <button
              type="button"
              onClick={() => setSidebarCollapsed((current) => !current)}
              className="absolute -right-4 top-6 z-20 flex h-8 w-8 items-center justify-center rounded-full border border-zinc-200 bg-white text-sm font-bold text-zinc-600 shadow-sm transition hover:border-orange-300 hover:text-orange-600"
              title={sidebarCollapsed ? "Expand menu" : "Hide menu"}
            >
              {sidebarCollapsed ? "›" : "‹"}
            </button>
          </div>
        </aside>

        <main className="min-w-0 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>

      {mobileMenuOpen ? (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            className="absolute inset-0 bg-black/40"
            aria-label="Close navigation"
          />

          <aside className="absolute inset-y-0 left-0 w-[290px] max-w-[86vw] border-r border-zinc-200 bg-[#f7f7f8] shadow-2xl">
            <div className="flex h-16 items-center justify-between border-b border-zinc-200 bg-white px-5">
              <div>
                <p className="text-sm font-bold text-zinc-950">
                  HM Shop Online
                </p>
                <p className="text-xs text-zinc-400">Admin Menu</p>
              </div>

              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 bg-white text-lg text-zinc-600"
              >
                ×
              </button>
            </div>

            <div className="h-[calc(100%-64px)]">{renderSidebar(true)}</div>
          </aside>
        </div>
      ) : null}
    </section>
  );
}
