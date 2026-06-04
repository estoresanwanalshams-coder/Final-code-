import {
  categories as fallbackCategories,
  mergeCategories,
  type Category,
} from "@/lib/categories";
import { supabase } from "@/lib/supabase";

type CategoryRow = {
  name: string;
  slug: string;
  description: string | null;
};

function mapCategoryRow(row: CategoryRow): Category {
  return {
    name: row.name,
    slug: row.slug,
    description: row.description ?? "",
  };
}

export async function fetchSupabaseCategories() {
  const { data, error } = await supabase
    .from("categories")
    .select("name, slug, description")
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => mapCategoryRow(row as CategoryRow));
}

export async function fetchMergedCategories() {
  const remoteCategories = await fetchSupabaseCategories().catch(() => []);
  return mergeCategories(remoteCategories, fallbackCategories);
}

function mapCategoryPayload(category: Category) {
  return {
    name: category.name.trim(),
    slug: category.slug.trim(),
    description: (category.description ?? "").trim(),
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
      .update({ name: payload.name, description: payload.description })
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
