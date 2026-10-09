
import { supabase } from "@/lib/supabase";

export type AdminCacheRefreshRequest = {
  type: "product" | "category" | "homepage";
  slug?: string;
  previousSlug?: string;
  categorySlug?: string;
  previousCategorySlug?: string;
};

export async function refreshAdminStorefrontCache(
  payload: AdminCacheRefreshRequest,
): Promise<void> {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error || !session?.access_token) {
    throw new Error(
      "Admin session unavailable. Storefront cache was not refreshed.",
    );
  }

  const response = await fetch("/api/admin/revalidate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(
      `Storefront cache refresh failed (HTTP ${response.status}).`,
    );
  }
}