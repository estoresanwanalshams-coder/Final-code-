import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawQuery = searchParams.get("q") ?? "";
  const query = rawQuery.trim();

  if (query.length < 1) {
    return NextResponse.json({ products: [] });
  }

  const likeQuery = `%${query}%`;
  const { data, error } = await supabase
    .from("products")
    .select("slug, name, image_url")
    .or(`name.ilike.${likeQuery},summary.ilike.${likeQuery}`)
    .order("created_at", { ascending: false })
    .limit(8);

  if (error) {
    return NextResponse.json(
      { error: "Unable to fetch suggestions." },
      { status: 500 },
    );
  }

  return NextResponse.json(
    {
      products: (data ?? []).map((product) => ({
        slug: product.slug,
        name: product.name,
        imageUrl: product.image_url ?? "/banners/banner-1.png",
      })),
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    },
  );
}
