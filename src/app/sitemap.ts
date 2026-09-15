import type { MetadataRoute } from "next";
import { fetchMergedCategories } from "@/lib/supabase-categories";
import { fetchSupabaseProducts } from "@/lib/supabase-products";

const SITE_URL = "https://www.hmshoponline.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, products] = await Promise.all([
    fetchMergedCategories(),
    fetchSupabaseProducts(),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${SITE_URL}/products`,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/categories`,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/about`,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/contact`,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  const categoryPages: MetadataRoute.Sitemap = categories
    .filter((category) => category.isActive !== false)
    .map((category) => ({
      url: `${SITE_URL}/categories/${category.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

  const productPages: MetadataRoute.Sitemap = products
    .filter((product) => product.status !== "draft")
    .map((product) => ({
      url: `${SITE_URL}/products/${product.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

  return [...staticPages, ...categoryPages, ...productPages];
}