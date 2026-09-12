import { supabase } from "@/lib/supabase";

export type HomepageBanner = {
  id: string;
  imageUrl: string;
  linkUrl?: string;
  isActive: boolean;
  displayOrder: number;
};

export type SiteSettings = {
  offerText: string;

  /**
   * Legacy single-banner field.
   * Kept temporarily for backwards compatibility.
   */
  bannerImageUrl: string;

  bannerSlides: HomepageBanner[];

  shippingCharge: number;
  newArrivalSlugs: string[];
  bestSellerSlugs: string[];
  featuredSlugs: string[];
  homepageCategorySlugs: string[];
};

type SiteSettingsRow = {
  id: string;
  offer_text: string | null;
  banner_image_url: string | null;
  banner_slides: unknown;
  shipping_charge: number | null;
  new_arrival_slugs: string[] | null;
  best_seller_slugs: string[] | null;
  featured_slugs: string[] | null;
  homepage_category_slugs: string[] | null;
};

export const defaultHomepageBanners: HomepageBanner[] = [
  {
    id: "banner-1",
    imageUrl: "/banners/banner-1.png",
    linkUrl: "",
    isActive: true,
    displayOrder: 1,
  },
  {
    id: "banner-2",
    imageUrl: "/banners/banner-2.png",
    linkUrl: "",
    isActive: true,
    displayOrder: 2,
  },
  {
    id: "banner-3",
    imageUrl: "/banners/banner-3.png",
    linkUrl: "",
    isActive: true,
    displayOrder: 3,
  },
];

export const defaultSiteSettings: SiteSettings = {
  offerText:
    "Shop across the UAE | Cash on Delivery Available | Fast & Reliable Delivery",

  bannerImageUrl: "/banners/banner-1.png",

  bannerSlides: defaultHomepageBanners,

  shippingCharge: 30,
  newArrivalSlugs: [],
  bestSellerSlugs: [],
  featuredSlugs: [],
  homepageCategorySlugs: [],
};

function normalizeBannerSlides(
  value: unknown,
): HomepageBanner[] {
  if (!Array.isArray(value)) {
    return defaultHomepageBanners;
  }

  const banners = value
    .map((item, index) => {
      if (
        !item ||
        typeof item !== "object"
      ) {
        return null;
      }

      const record = item as Record<string, unknown>;

      const imageUrl =
        typeof record.imageUrl === "string"
          ? record.imageUrl.trim()
          : "";

      if (!imageUrl) {
        return null;
      }

      return {
        id:
          typeof record.id === "string" &&
            record.id.trim()
            ? record.id
            : `banner-${index + 1}`,

        imageUrl,
        linkUrl:
          typeof record.linkUrl === "string"
            ? record.linkUrl.trim()
            : "",
        isActive:
          typeof record.isActive === "boolean"
            ? record.isActive
            : true,

        displayOrder:
          typeof record.displayOrder === "number" &&
            Number.isFinite(record.displayOrder)
            ? record.displayOrder
            : index + 1,
      } satisfies HomepageBanner;
    })
    .filter(Boolean) as HomepageBanner[];

  if (!banners.length) {
    return defaultHomepageBanners;
  }

  return banners.sort(
    (a, b) =>
      a.displayOrder - b.displayOrder,
  );
}

function mapSettingsRow(
  row: SiteSettingsRow,
): SiteSettings {
  return {
    offerText:
      row.offer_text ??
      defaultSiteSettings.offerText,

    bannerImageUrl:
      row.banner_image_url ??
      defaultSiteSettings.bannerImageUrl,

    bannerSlides:
      normalizeBannerSlides(
        row.banner_slides,
      ),

    shippingCharge: Number(
      row.shipping_charge ??
      defaultSiteSettings.shippingCharge,
    ),

    newArrivalSlugs:
      row.new_arrival_slugs ?? [],

    bestSellerSlugs:
      row.best_seller_slugs ?? [],

    featuredSlugs:
      row.featured_slugs ?? [],

    homepageCategorySlugs:
      row.homepage_category_slugs ?? [],
  };
}

function mapSettingsToRow(
  settings: SiteSettings,
) {
  return {
    id: "main",

    offer_text:
      settings.offerText,

    banner_image_url:
      settings.bannerImageUrl,

    banner_slides:
      settings.bannerSlides,

    shipping_charge: Math.max(
      0,
      Number(settings.shippingCharge) || 0,
    ),

    new_arrival_slugs:
      settings.newArrivalSlugs,

    best_seller_slugs:
      settings.bestSellerSlugs,

    featured_slugs:
      settings.featuredSlugs,

    homepage_category_slugs:
      settings.homepageCategorySlugs,
  };
}

export async function fetchSiteSettings() {
  const primaryQuery = await supabase
    .from("site_settings")
    .select(
      "id, offer_text, banner_image_url, banner_slides, shipping_charge, new_arrival_slugs, best_seller_slugs, featured_slugs, homepage_category_slugs",
    )
    .eq("id", "main")
    .maybeSingle();

  if (!primaryQuery.error) {
    const data =
      primaryQuery.data as SiteSettingsRow | null;

    return data
      ? mapSettingsRow(data)
      : defaultSiteSettings;
  }

  /*
   * Compatibility fallback for older databases.
   */
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

  const fallbackData =
    fallbackQuery.data as
    | Omit<
      SiteSettingsRow,
      "shipping_charge" | "banner_slides" | "homepage_category_slugs"
    >
    | null;

  if (!fallbackData) {
    return defaultSiteSettings;
  }

  return {
    offerText:
      fallbackData.offer_text ??
      defaultSiteSettings.offerText,

    bannerImageUrl:
      fallbackData.banner_image_url ??
      defaultSiteSettings.bannerImageUrl,

    bannerSlides:
      defaultHomepageBanners,

    shippingCharge:
      defaultSiteSettings.shippingCharge,

    newArrivalSlugs:
      fallbackData.new_arrival_slugs ?? [],

    bestSellerSlugs:
      fallbackData.best_seller_slugs ?? [],

    featuredSlugs:
      fallbackData.featured_slugs ?? [],

    homepageCategorySlugs: [],
  };
}

export async function updateSiteSettings(
  settings: SiteSettings,
) {
  const primary = await supabase
    .from("site_settings")
    .upsert(
      mapSettingsToRow(settings),
      {
        onConflict: "id",
      },
    );

  if (!primary.error) {
    return;
  }

  /*
   * Legacy compatibility fallback.
   */
  const legacyPayload = {
    id: "main",

    offer_text:
      settings.offerText,

    banner_image_url:
      settings.bannerImageUrl,

    new_arrival_slugs:
      settings.newArrivalSlugs,

    best_seller_slugs:
      settings.bestSellerSlugs,

    featured_slugs:
      settings.featuredSlugs,
  };

  const fallback = await supabase
    .from("site_settings")
    .upsert(
      legacyPayload,
      {
        onConflict: "id",
      },
    );

  if (fallback.error) {
    throw fallback.error;
  }
}