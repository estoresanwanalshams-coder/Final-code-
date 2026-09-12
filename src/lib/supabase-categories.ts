import { type Category } from "@/lib/categories";
import { supabase } from "@/lib/supabase";

type CategoryRow = {
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  is_active: boolean | null;
  display_order: number | null;
};

function mapCategoryRow(row: CategoryRow): Category {
  return {
    name: row.name,
    slug: row.slug,
    description: row.description ?? "",
    imageUrl: row.image_url?.trim() || undefined,
    isActive: row.is_active ?? true,
    displayOrder: row.display_order ?? 0,
  };
}

export async function fetchSupabaseCategories() {
  const { data, error } = await supabase
    .from("categories")
    .select(
      "name, slug, description, image_url, is_active, display_order, created_at",
    )
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => mapCategoryRow(row as CategoryRow));
}

/**
 * Kept for compatibility with existing callers.
 *
 * Important:
 * Do not merge built-in fallback categories after a successful Supabase fetch.
 * Public RLS intentionally hides inactive categories. Merging the local defaults
 * back in would make an inactive category visible again.
 *
 * Existing callers already provide their own fallback when Supabase is
 * unavailable.
 */
export async function fetchMergedCategories() {
  return fetchSupabaseCategories();
}

function mapCategoryPayload(category: Category) {
  return {
    name: category.name.trim(),
    slug: category.slug.trim(),
    description: (category.description ?? "").trim(),
    image_url: category.imageUrl?.trim() || null,
    is_active: category.isActive ?? true,
    display_order: category.displayOrder ?? 0,
  };
}

export async function upsertSupabaseCategory(category: Category) {
  const payload = mapCategoryPayload(category);

  if (!payload.name || !payload.slug) {
    throw new Error("Category name is required.");
  }

  const { data: existing, error: lookupError } = await supabase
    .from("categories")
    .select("slug")
    .eq("slug", payload.slug)
    .maybeSingle();

  if (lookupError) {
    throw lookupError;
  }

  if (existing) {
    const { error } = await supabase
      .from("categories")
      .update({
        name: payload.name,
        description: payload.description,
        image_url: payload.image_url,
        is_active: payload.is_active,
        display_order: payload.display_order,
      })
      .eq("slug", payload.slug);

    if (error) {
      throw error;
    }

    return;
  }

  const { error } = await supabase.from("categories").insert(payload);

  if (error) {
    throw error;
  }
}

export async function deleteSupabaseCategory(slug: string) {
  const { error } = await supabase.from("categories").delete().eq("slug", slug);

  if (error) {
    throw error;
  }
}