import { NextResponse } from "next/server";

import { rankProductsForSearch } from "@/lib/product-search";
import type { Product } from "@/lib/products";
import type { CategorySlug } from "@/lib/categories";
import { supabase } from "@/lib/supabase";

type SuggestionProductRow = {
  name: string;
  slug: string;
  category_slug: string;
  sku: string | null;
  brand: string | null;
  status: "active" | "draft" | null;
  stock_status:
    | "in_stock"
    | "out_of_stock"
    | null;
  search_keywords: string[] | null;
  price: number | string;
  summary: string | null;
  details: string | null;
  image_url: string | null;
};

export async function GET(
  request: Request,
) {
  const { searchParams } =
    new URL(request.url);

  const query = (
    searchParams.get("q") ?? ""
  ).trim();

  if (query.length < 1) {
    return NextResponse.json({
      products: [],
    });
  }

  const { data, error } =
    await supabase
      .from("products")
      .select(
        [
          "name",
          "slug",
          "category_slug",
          "sku",
          "brand",
          "status",
          "stock_status",
          "search_keywords",
          "price",
          "summary",
          "details",
          "image_url",
        ].join(", "),
      )
      .eq("status", "active")
      .order("created_at", {
        ascending: false,
      });

  if (error) {
    return NextResponse.json(
      {
        error:
          "Unable to fetch suggestions.",
      },
      {
        status: 500,
      },
    );
  }

  const products = (
  (data ?? []) as unknown as SuggestionProductRow[]
).map(
    (row): Product => ({
      name: row.name,

      slug: row.slug,

      categorySlug:
        row.category_slug as CategorySlug,

      sku:
        row.sku?.trim() ||
        undefined,

      brand:
        row.brand?.trim() ||
        undefined,

      status:
        row.status ?? "active",

      stockStatus:
        row.stock_status ??
        "in_stock",

      searchKeywords:
        row.search_keywords ?? [],

      price: Number(row.price),

      summary:
        row.summary ?? "",

      details:
        row.details ?? "",

      imageUrl:
        row.image_url ??
        "/banners/banner-1.png",
    }),
  );

  const suggestions =
    rankProductsForSearch(
      products,
      query,
    ).slice(0, 8);

  return NextResponse.json(
    {
      products:
        suggestions.map(
          (product) => ({
            slug:
              product.slug,

            name:
              product.name,

            imageUrl:
              product.imageUrl,
          }),
        ),
    },
    {
      headers: {
        "Cache-Control":
          "public, s-maxage=60, stale-while-revalidate=300",
      },
    },
  );
}