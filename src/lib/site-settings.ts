import { supabase } from "@/lib/supabase";

export type SiteSettings = {
  offerText: string;
  bannerImageUrl: string;
  shippingCharge: number;
  newArrivalSlugs: string[];
  bestSellerSlugs: string[];
  featuredSlugs: string[];
};

type SiteSettingsRow = {
  id: string;
  offer_text: string | null;
  banner_image_url: string | null;
  shipping_charge: number | null;
  new_arrival_slugs: string[] | null;
  best_seller_slugs: string[] | null;
  featured_slugs: string[] | null;
};

export const defaultSiteSettings: SiteSettings = {
  offerText: "Free shipping on orders over Rs. 999 | New season offers are live",
  bannerImageUrl: "/banners/banner-1.png",
  shippingCharge: 40,
  newArrivalSlugs: [],
  bestSellerSlugs: [],
  featuredSlugs: [],
};

function mapSettingsRow(row: SiteSettingsRow): SiteSettings {
  return {
    offerText: row.offer_text ?? defaultSiteSettings.offerText,
    bannerImageUrl: row.banner_image_url ?? defaultSiteSettings.bannerImageUrl,
    shippingCharge: Number(row.shipping_charge ?? defaultSiteSettings.shippingCharge),
    newArrivalSlugs: row.new_arrival_slugs ?? [],
    bestSellerSlugs: row.best_seller_slugs ?? [],
    featuredSlugs: row.featured_slugs ?? [],
  };
}

function mapSettingsToRow(settings: SiteSettings) {
  return {
    id: "main",
    offer_text: settings.offerText,
    banner_image_url: settings.bannerImageUrl,
    shipping_charge: Math.max(0, Number(settings.shippingCharge) || 0),
    new_arrival_slugs: settings.newArrivalSlugs,
    best_seller_slugs: settings.bestSellerSlugs,
    featured_slugs: settings.featuredSlugs,
  };
}

export async function fetchSiteSettings() {
  const primaryQuery = await supabase
    .from("site_settings")
    .select(
      "id, offer_text, banner_image_url, shipping_charge, new_arrival_slugs, best_seller_slugs, featured_slugs",
    )
    .eq("id", "main")
    .maybeSingle();

  if (!primaryQuery.error) {
    const data = primaryQuery.data as SiteSettingsRow | null;
    return data ? mapSettingsRow(data) : defaultSiteSettings;
  }

  const fallbackQuery = await supabase
    .from("site_settings")
    .select(
      "id, offer_text, banner_image_url, new_arrival_slugs, best_seller_slugs, featured_slugs",
    )
    .eq("id", "main")
    .maybeSingle();

  if (fallbackQuery.error) {
    throw fallbackQuery.error;
  }

  const fallbackData = fallbackQuery.data as Omit<SiteSettingsRow, "shipping_charge"> | null;
  if (!fallbackData) {
    return defaultSiteSettings;
  }

  return {
    offerText: fallbackData.offer_text ?? defaultSiteSettings.offerText,
    bannerImageUrl: fallbackData.banner_image_url ?? defaultSiteSettings.bannerImageUrl,
    shippingCharge: defaultSiteSettings.shippingCharge,
    newArrivalSlugs: fallbackData.new_arrival_slugs ?? [],
    bestSellerSlugs: fallbackData.best_seller_slugs ?? [],
    featuredSlugs: fallbackData.featured_slugs ?? [],
  };
}

export async function updateSiteSettings(settings: SiteSettings) {
  const primary = await supabase
    .from("site_settings")
    .upsert(mapSettingsToRow(settings), { onConflict: "id" });

  if (!primary.error) {
    return;
  }

  const { shippingCharge, ...legacySettings } = settings;
  void shippingCharge;
  const legacyPayload = {
    id: "main",
    offer_text: legacySettings.offerText,
    banner_image_url: legacySettings.bannerImageUrl,
    new_arrival_slugs: legacySettings.newArrivalSlugs,
    best_seller_slugs: legacySettings.bestSellerSlugs,
    featured_slugs: legacySettings.featuredSlugs,
  };
  const fallback = await supabase
    .from("site_settings")
    .upsert(legacyPayload, { onConflict: "id" });

  if (fallback.error) {
    throw fallback.error;
  }
}
