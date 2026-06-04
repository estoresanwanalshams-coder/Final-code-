"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { categories, type Category } from "@/lib/categories";
import { fetchMergedCategories } from "@/lib/supabase-categories";

type DynamicCategorySidebarLinksProps = {
  activeSlug?: string;
};

export function DynamicCategorySidebarLinks({
  activeSlug,
}: DynamicCategorySidebarLinksProps) {
  const [items, setItems] = useState<Category[]>(categories);

  useEffect(() => {
    async function loadCategories() {
      setItems(await fetchMergedCategories().catch(() => categories));
    }

    const timer = window.setTimeout(loadCategories, 0);

    return () => window.clearTimeout(timer);
  }, []);

  return (
    <>
      {items.map((category) => {
        const isActive = category.slug === activeSlug;

        return (
          <Link
            key={category.slug}
            href={`/categories/${category.slug}`}
            prefetch={false}
            className={`rounded-md px-3 py-2 text-sm font-semibold transition ${
              isActive
                ? "bg-zinc-950 text-white"
                : "text-zinc-700 hover:bg-zinc-50 hover:text-zinc-950"
            }`}
          >
            {category.name}
          </Link>
        );
      })}
    </>
  );
}
