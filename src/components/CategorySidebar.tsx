import Link from "next/link";
import { DynamicCategorySidebarLinks } from "@/components/DynamicCategorySidebarLinks";

type CategorySidebarProps = {
  activeSlug?: string;
};

export function CategorySidebar({ activeSlug }: CategorySidebarProps) {
  return (
    <aside className="content-reveal border border-zinc-200 bg-white p-4">
      <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-500">
        Categories
      </h2>
      <nav className="mt-4 flex flex-col gap-1">
        <Link
          href="/categories"
          className={`rounded-md px-3 py-2 text-sm font-semibold transition ${
            activeSlug
              ? "text-zinc-700 hover:bg-zinc-50 hover:text-zinc-950"
              : "bg-zinc-950 text-white"
          }`}
        >
          All products
        </Link>
        <DynamicCategorySidebarLinks activeSlug={activeSlug} />
      </nav>
    </aside>
  );
}
