"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { categories, type Category } from "@/lib/categories";
import { fetchMergedCategories } from "@/lib/supabase-categories";

type DynamicCategoryLinksProps = {
  mobile?: boolean;
  onNavigate?: () => void;
};

export function DynamicCategoryLinks({
  mobile = false,
  onNavigate,
}: DynamicCategoryLinksProps) {
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
      {items.map((category) => (
        <Link
          key={category.slug}
          href={`/categories/${category.slug}`}
          prefetch={false}
          className={
            mobile
              ? "text-sm font-medium text-zinc-600"
              : "rounded-md px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 hover:text-zinc-950"
          }
          onClick={onNavigate}
        >
          {category.name}
        </Link>
      ))}
    </>
  );
}
