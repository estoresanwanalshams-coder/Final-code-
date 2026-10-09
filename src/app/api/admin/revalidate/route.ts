import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { isAdminEmail } from "@/lib/auth-role";
import { getSupabasePublicKey } from "@/lib/supabase-env";

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace(/^Bearer\s+/i, "").trim();

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      getSupabasePublicKey()!,
    );

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user?.email || !isAdminEmail(user.email)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json().catch(() => ({}))) as {
      slug?: string;
      previousSlug?: string;
      categorySlug?: string;
      previousCategorySlug?: string;
      type?: "product" | "category" | "homepage";
    };

    const refreshCategory = (slug?: string) => {
      if (slug) {
        revalidatePath(`/categories/${slug}`);
      }
    };

    if (body.type === "homepage") {
      revalidatePath("/");
    } else if (body.type === "category") {
      revalidatePath("/");
      revalidatePath("/categories");
      revalidatePath("/products");
      revalidatePath("/search");

      refreshCategory(body.slug);
      refreshCategory(body.previousSlug);
    } else {
      // Default to product behavior for existing callers.
      revalidatePath("/");
      revalidatePath("/products");
      revalidatePath("/categories");
      revalidatePath("/search");

      if (body.previousSlug && body.previousSlug !== body.slug) {
        revalidatePath(`/products/${body.previousSlug}`);
        revalidatePath(`/inquiry/${body.previousSlug}`);
      }

      if (body.slug) {
        revalidatePath(`/products/${body.slug}`);
        revalidatePath(`/inquiry/${body.slug}`);
      }

      refreshCategory(body.categorySlug);
      refreshCategory(body.previousCategorySlug);
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unable to revalidate." }, { status: 500 });
  }
}
