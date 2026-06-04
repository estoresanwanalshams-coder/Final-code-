import { supabase } from "@/lib/supabase";
import type { CategorySlug } from "@/lib/categories";
import { normalizeImageUrl, normalizeImageUrls } from "@/lib/image-url";
import type { Product } from "@/lib/products";

type ProductRow = {
  id?: string;
  name: string;
  slug: string;
  category_slug: string;
  actual_price?: number | string | null;
  price: number | string;
  summary: string | null;
  details: string | null;
  image_url: string | null;
  image_urls: string[] | null;
  video_url: string | null;
};

type ProductImageRow = {
  product_id: string;
  image_url: string;
  is_main: boolean;
  sort_order: number;
};

export type ProductListResult = {
  products: Product[];
  hasNextPage: boolean;
  totalPages: number;
  currentPage: number;
};

function mapProductRow(row: ProductRow): Product {
  const primaryImage = normalizeImageUrl(
    row.image_url ?? row.image_urls?.[0] ?? "/banners/banner-1.png",
  );
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    categorySlug: row.category_slug as CategorySlug,
    actualPrice:
      row.actual_price !== null && row.actual_price !== undefined
        ? Number(row.actual_price)
        : undefined,
    price: Number(row.price),
    summary: row.summary ?? "",
    details: row.details ?? "",
    imageUrl: primaryImage,
    imageUrls: normalizeImageUrls(
      row.image_urls?.length ? row.image_urls : [primaryImage],
    ),
    videoUrl: row.video_url ?? undefined,
  };
}

function mapProductRowWithImages(
  row: ProductRow,
  managedImages: string[] | undefined,
): Product {
  if (!managedImages || managedImages.length === 0) {
    return mapProductRow(row);
  }

  const normalizedImages = normalizeImageUrls(managedImages);
  const primaryImage = normalizedImages[0] ?? "/banners/banner-1.png";

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    categorySlug: row.category_slug as CategorySlug,
    actualPrice:
      row.actual_price !== null && row.actual_price !== undefined
        ? Number(row.actual_price)
        : undefined,
    price: Number(row.price),
    summary: row.summary ?? "",
    details: row.details ?? "",
    imageUrl: primaryImage,
    imageUrls: normalizedImages,
    videoUrl: row.video_url ?? undefined,
  };
}

function mapProductToRow(product: Product): ProductRow {
  const mainImage = normalizeImageUrl(product.imageUrl);
  const imageUrls = normalizeImageUrls(product.imageUrls ?? [mainImage]);

  return {
    name: product.name,
    slug: product.slug,
    category_slug: product.categorySlug,
    actual_price: product.actualPrice ?? null,
    price: product.price,
    summary: product.summary,
    details: product.details,
    image_url: mainImage,
    image_urls: imageUrls,
    video_url: product.videoUrl ?? null,
  };
}

export async function fetchSupabaseProducts() {
  const { data, error } = await supabase
    .from("products")
    .select("id, name, slug, category_slug, actual_price, price, summary, details, image_url, image_urls, video_url")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  const rows = (data ?? []) as ProductRow[];
  const rowIds = rows
    .map((row) => row.id)
    .filter((id): id is string => Boolean(id));
  const imagesByProductId = await fetchProductImagesMap(rowIds).catch(
    () => new Map<string, string[]>(),
  );

  return rows.map((row) =>
    mapProductRowWithImages(row, imagesByProductId.get(row.id ?? "")),
  );
}

type FetchSupabaseProductsPageOptions = {
  categorySlug?: string;
  page?: number;
  pageSize?: number;
};

export async function fetchSupabaseProductsPage(
  options: FetchSupabaseProductsPageOptions = {},
): Promise<ProductListResult> {
  const page = Math.max(1, options.page ?? 1);
  const pageSize = Math.max(1, Math.min(60, options.pageSize ?? 24));
  const from = (page - 1) * pageSize;
  const to = from + pageSize;

  let query = supabase
    .from("products")
    .select("id, name, slug, category_slug, price, actual_price, image_url, image_urls", {
      count: "exact",
    })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (options.categorySlug) {
    query = query.eq("category_slug", options.categorySlug);
  }

  const { data, error, count } = await query;

  if (error) {
    throw error;
  }

  const rows = (data ?? []) as ProductRow[];
  const hasNextPage = rows.length > pageSize;
  const currentRows = hasNextPage ? rows.slice(0, pageSize) : rows;

  return {
    products: currentRows.map((row) => mapProductRow(row)),
    hasNextPage,
    totalPages: Math.max(1, Math.ceil((count ?? 0) / pageSize)),
    currentPage: page,
  };
}

export async function fetchSupabaseProductBySlug(slug: string) {
  const { data, error } = await supabase
    .from("products")
    .select("id, name, slug, category_slug, actual_price, price, summary, details, image_url, image_urls, video_url")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  const row = data as ProductRow;
  if (!row.id) {
    return mapProductRow(row);
  }

  const imagesByProductId = await fetchProductImagesMap([row.id]).catch(
    () => new Map<string, string[]>(),
  );
  return mapProductRowWithImages(row, imagesByProductId.get(row.id));
}

export async function fetchSupabaseRelatedProducts(
  categorySlug: string,
  excludeSlug: string,
  limit = 4,
) {
  const { data, error } = await supabase
    .from("products")
    .select("id, name, slug, category_slug, actual_price, price, image_url, image_urls")
    .eq("category_slug", categorySlug)
    .neq("slug", excludeSlug)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw error;
  }

  const rows = (data ?? []) as ProductRow[];
  const rowIds = rows
    .map((row) => row.id)
    .filter((id): id is string => Boolean(id));
  const imagesByProductId = await fetchProductImagesMap(rowIds).catch(
    () => new Map<string, string[]>(),
  );
  return rows.map((row) =>
    mapProductRowWithImages(row, imagesByProductId.get(row.id ?? "")),
  );
}

type FetchSupabaseSearchProductsOptions = {
  page?: number;
  pageSize?: number;
};

export async function fetchSupabaseSearchProducts(
  queryText: string,
  options: FetchSupabaseSearchProductsOptions = {},
): Promise<ProductListResult> {
  const page = Math.max(1, options.page ?? 1);
  const pageSize = Math.max(1, Math.min(60, options.pageSize ?? 24));
  const from = (page - 1) * pageSize;
  const to = from + pageSize;
  const query = queryText.trim();

  let builder = supabase
    .from("products")
    .select("id, name, slug, category_slug, actual_price, price, image_url, image_urls", {
      count: "exact",
    })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (query) {
    const likeQuery = `%${query}%`;
    builder = builder.or(
      `name.ilike.${likeQuery},summary.ilike.${likeQuery},details.ilike.${likeQuery}`,
    );
  }

  const { data, error, count } = await builder;

  if (error) {
    throw error;
  }

  const rows = (data ?? []) as ProductRow[];
  const hasNextPage = rows.length > pageSize;
  const currentRows = hasNextPage ? rows.slice(0, pageSize) : rows;

  return {
    products: currentRows.map((row) => mapProductRow(row)),
    hasNextPage,
    totalPages: Math.max(1, Math.ceil((count ?? 0) / pageSize)),
    currentPage: page,
  };
}

export async function upsertSupabaseProduct(product: Product) {
  const payload = mapProductToRow(product);

  if (!payload.name.trim() || !payload.slug.trim()) {
    throw new Error("Product name is required.");
  }

  const { data: existing, error: lookupError } = await supabase
    .from("products")
    .select("slug")
    .eq("slug", payload.slug)
    .maybeSingle();

  if (lookupError) {
    throw lookupError;
  }

  if (existing) {
    const { error } = await supabase
      .from("products")
      .update(payload)
      .eq("slug", payload.slug);

    if (error) {
      throw error;
    }

    const productId = await fetchProductIdBySlug(payload.slug);
    if (productId) {
      await syncProductImages(
        productId,
        (payload.image_urls ?? [payload.image_url]).filter(
          (url): url is string => Boolean(url),
        ),
        payload.image_url ?? "",
      );
    }

    return;
  }

  const { error } = await supabase.from("products").insert(payload);

  if (error) {
    throw error;
  }

  const productId = await fetchProductIdBySlug(payload.slug);
  if (productId) {
    await syncProductImages(
      productId,
      (payload.image_urls ?? [payload.image_url]).filter(
        (url): url is string => Boolean(url),
      ),
      payload.image_url ?? "",
    );
  }
}

export async function deleteSupabaseProduct(slug: string) {
  const { error } = await supabase.from("products").delete().eq("slug", slug);

  if (error) {
    throw error;
  }
}

export async function uploadProductImage(file: File) {
  const fileExt = file.name.split(".").pop() ?? "jpg";
  const filePath = `${crypto.randomUUID()}.${fileExt}`;
  const { error } = await supabase.storage
    .from("product-images")
    .upload(filePath, file, {
      cacheControl: "31536000",
      upsert: false,
    });

  if (error) {
    throw error;
  }

  const { data } = supabase.storage
    .from("product-images")
    .getPublicUrl(filePath);

  return data.publicUrl;
}

async function fetchProductIdBySlug(slug: string) {
  const { data, error } = await supabase
    .from("products")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data?.id as string | undefined;
}

async function syncProductImages(productId: string, imageUrls: string[], mainImageUrl: string) {
  const normalizedImages = normalizeImageUrls(imageUrls);
  if (normalizedImages.length === 0) {
    return;
  }

  const main = normalizeImageUrl(mainImageUrl) || normalizedImages[0];
  const ordered = [main, ...normalizedImages.filter((url) => url !== main)];

  const { error: deleteError } = await supabase
    .from("product_images")
    .delete()
    .eq("product_id", productId);

  if (deleteError) {
    throw deleteError;
  }

  const rows = ordered.map((url, index) => ({
    product_id: productId,
    image_url: url,
    is_main: index === 0,
    sort_order: index,
  }));

  const { error: insertError } = await supabase.from("product_images").insert(rows);
  if (insertError) {
    throw insertError;
  }
}

async function fetchProductImagesMap(productIds: string[]) {
  if (productIds.length === 0) {
    return new Map<string, string[]>();
  }

  const { data, error } = await supabase
    .from("product_images")
    .select("product_id, image_url, is_main, sort_order")
    .in("product_id", productIds)
    .order("sort_order", { ascending: true });

  if (error) {
    throw error;
  }

  const grouped = new Map<string, ProductImageRow[]>();
  ((data ?? []) as ProductImageRow[]).forEach((row) => {
    const current = grouped.get(row.product_id) ?? [];
    current.push(row);
    grouped.set(row.product_id, current);
  });

  const mapped = new Map<string, string[]>();
  grouped.forEach((rows, productId) => {
    const main = rows.find((row) => row.is_main);
    const ordered = main
      ? [main.image_url, ...rows.filter((row) => row.image_url !== main.image_url).map((row) => row.image_url)]
      : rows.map((row) => row.image_url);
    mapped.set(productId, ordered);
  });

  return mapped;
}
