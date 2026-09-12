"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Product } from "@/lib/products";
import type { Category } from "@/lib/categories";
import { fetchMergedCategories } from "@/lib/supabase-categories";
import {
  fetchSupabaseProducts,
  uploadProductImage,
} from "@/lib/supabase-products";
import { compressImageFile } from "@/lib/image-compression";
import { normalizeImageUrl } from "@/lib/image-url";
import {
  defaultSiteSettings,
  fetchSiteSettings,
  updateSiteSettings,
  type HomepageBanner,
  type SiteSettings,
} from "@/lib/site-settings";

type MerchandisingSelectorProps = {
  title: string;
  description: string;
  selectedSlugs: string[];
  products: Product[];
  maxSelect: number;
  onChange: (slugs: string[]) => void;
};

type CategorySelectorProps = {
  selectedSlugs: string[];
  categories: Category[];
  maxSelect: number;
  onChange: (slugs: string[]) => void;
};
export function AdminSiteSettingsPanel() {
  const [settings, setSettings] = useState<SiteSettings>(defaultSiteSettings);

  const [products, setProducts] = useState<Product[]>([]);
  const [categoryItems, setCategoryItems] = useState<Category[]>([]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [pendingBannerFiles, setPendingBannerFiles] = useState<
    Record<string, File>
  >({});

  const [bannerPreviews, setBannerPreviews] = useState<Record<string, string>>(
    {},
  );

  useEffect(() => {
    let active = true;

    async function loadSettings() {
      try {
        const [nextSettings, nextProducts, nextCategories] = await Promise.all([
          fetchSiteSettings().catch(() => defaultSiteSettings),
          fetchSupabaseProducts().catch(() => []),
          fetchMergedCategories().catch(() => []),
        ]);

        if (!active) {
          return;
        }

        setSettings(nextSettings);
        setProducts(nextProducts);
        setCategoryItems(nextCategories);
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void loadSettings();

    return () => {
      active = false;
    };
  }, []);

  const activeProducts = useMemo(
    () =>
      products.filter((product) => (product.status ?? "active") === "active"),
    [products],
  );

  const activeCategories = useMemo(
    () =>
      categoryItems
        .filter((category) => category.isActive ?? true)
        .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0)),
    [categoryItems],
  );

  const newArrivals = useMemo(
    () => activeProducts.slice(0, 8),
    [activeProducts],
  );

  function updateField<K extends keyof SiteSettings>(
    field: K,
    value: SiteSettings[K],
  ) {
    setSettings((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function addBanner() {
    const highestOrder = settings.bannerSlides.reduce(
      (highest, banner) => Math.max(highest, banner.displayOrder),
      0,
    );

    const banner: HomepageBanner = {
      id: crypto.randomUUID(),
      imageUrl: "",
      linkUrl: "",
      isActive: true,
      displayOrder: highestOrder + 1,
    };

    setSettings((current) => ({
      ...current,
      bannerSlides: [...current.bannerSlides, banner],
    }));
  }

  function updateBanner(id: string, changes: Partial<HomepageBanner>) {
    setSettings((current) => ({
      ...current,
      bannerSlides: current.bannerSlides.map((banner) =>
        banner.id === id
          ? {
              ...banner,
              ...changes,
            }
          : banner,
      ),
    }));
  }

  function selectBannerFile(bannerId: string, file?: File) {
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setMessage("Please select a valid banner image.");
      return;
    }

    const existingPreview = bannerPreviews[bannerId];

    if (existingPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(existingPreview);
    }

    const preview = URL.createObjectURL(file);

    setPendingBannerFiles((current) => ({
      ...current,
      [bannerId]: file,
    }));

    setBannerPreviews((current) => ({
      ...current,
      [bannerId]: preview,
    }));

    setMessage("");
  }

  function removeBanner(id: string) {
    const preview = bannerPreviews[id];

    if (preview?.startsWith("blob:")) {
      URL.revokeObjectURL(preview);
    }

    setPendingBannerFiles((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });

    setBannerPreviews((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });

    setSettings((current) => ({
      ...current,
      bannerSlides: current.bannerSlides.filter((banner) => banner.id !== id),
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsSaving(true);
    setMessage("");

    try {
      const uploadedUrls = new Map<string, string>();

      for (const banner of settings.bannerSlides) {
        const file = pendingBannerFiles[banner.id];

        if (file) {
          const compressedFile = await compressImageFile(file);

          const uploadedUrl = await uploadProductImage(compressedFile);

          uploadedUrls.set(banner.id, normalizeImageUrl(uploadedUrl));
        }
      }

      const nextBannerSlides = settings.bannerSlides
        .map((banner) => ({
          ...banner,

          imageUrl:
            uploadedUrls.get(banner.id) ??
            (banner.imageUrl ? normalizeImageUrl(banner.imageUrl) : ""),

          displayOrder: Math.max(
            0,
            Math.floor(Number(banner.displayOrder) || 0),
          ),
        }))
        .filter((banner) => banner.imageUrl.trim())
        .sort((a, b) => a.displayOrder - b.displayOrder);

      if (!nextBannerSlides.length) {
        throw new Error("Add at least one banner image before saving.");
      }

      const nextSettings: SiteSettings = {
        ...settings,
        bannerSlides: nextBannerSlides,
      };

      await updateSiteSettings(nextSettings);

      setSettings(nextSettings);
      setPendingBannerFiles({});
      setBannerPreviews({});

      setMessage("Homepage settings updated successfully.");
    } catch (error) {
      const detail =
        error && typeof error === "object" && "message" in error
          ? String(error.message)
          : "Unknown error";

      setMessage(`Unable to save homepage settings: ${detail}`);
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1500px]">
          <p className="text-sm font-semibold text-zinc-500">
            Loading homepage settings...
          </p>
        </div>
      </div>
    );
  }

  return (
    <section className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px]">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-orange-600">
            Storefront
          </p>

          <h1 className="mt-2 text-3xl font-bold text-zinc-950">Homepage</h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-500">
            Control your storefront announcement, delivery charge, hero banner
            and featured product sections.
          </p>
        </div>

        {message ? (
          <div className="mt-6 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold text-zinc-700 shadow-sm">
            {message}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="mt-7 space-y-6">
          <SettingsCard
            title="Store Announcement & Delivery"
            description="Manage the message shown across the top of your storefront and the standard UAE delivery charge."
          >
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_260px]">
              <LightField label="Top offer text">
                <input
                  value={settings.offerText}
                  onChange={(event) =>
                    updateField("offerText", event.target.value)
                  }
                  placeholder="Shop across the UAE..."
                  required
                  className={inputClass}
                />

                <p className="mt-2 text-xs leading-5 text-zinc-400">
                  This message appears in the top announcement bar on the
                  storefront.
                </p>
              </LightField>

              <LightField label="Shipping charge (AED)">
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={settings.shippingCharge}
                  onChange={(event) =>
                    updateField(
                      "shippingCharge",
                      Math.max(0, Number(event.target.value) || 0),
                    )
                  }
                  required
                  className={inputClass}
                />

                <p className="mt-2 text-xs leading-5 text-zinc-400">
                  Enter 0 for free standard delivery.
                </p>
              </LightField>
            </div>
          </SettingsCard>

          <SettingsCard
            title="Hero Banners"
            description="Upload and manage the promotional banners displayed in the homepage carousel."
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-zinc-900">
                  Homepage carousel
                </p>

                <p className="mt-1 text-xs leading-5 text-zinc-500">
                  Active banners are displayed from the lowest order number to
                  the highest.
                </p>
              </div>

              <button
                type="button"
                onClick={addBanner}
                className="rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-orange-600"
              >
                + Add Banner
              </button>
            </div>

            <div className="mt-5 space-y-4">
              {[...settings.bannerSlides]
                .sort((a, b) => a.displayOrder - b.displayOrder)
                .map((banner, index) => {
                  const previewUrl =
                    bannerPreviews[banner.id] ?? banner.imageUrl;

                  return (
                    <div
                      key={banner.id}
                      className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4"
                    >
                      <div className="grid gap-5 xl:grid-cols-[320px_minmax(0,1fr)]">
                        <div>
                          <div className="flex aspect-[16/7] items-center justify-center overflow-hidden rounded-xl border border-zinc-200 bg-white">
                            {previewUrl ? (
                              <Image
                                src={previewUrl}
                                alt={`Banner ${index + 1}`}
                                width={900}
                                height={394}
                                unoptimized
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="text-center">
                                <p className="text-sm font-bold text-zinc-400">
                                  New Banner
                                </p>

                                <p className="mt-1 text-xs text-zinc-400">
                                  Upload an image or enter a URL.
                                </p>
                              </div>
                            )}
                          </div>

                          <p className="mt-2 text-xs font-semibold text-zinc-400">
                            Banner {index + 1}
                          </p>
                        </div>

                        <div className="grid content-start gap-4">
                          <div className="grid gap-4 sm:grid-cols-2">
                            <LightField label="Display order">
                              <input
                                type="number"
                                min="0"
                                step="1"
                                value={banner.displayOrder}
                                onChange={(event) =>
                                  updateBanner(banner.id, {
                                    displayOrder: Math.max(
                                      0,
                                      Number(event.target.value) || 0,
                                    ),
                                  })
                                }
                                className={inputClass}
                              />
                            </LightField>

                            <LightField label="Status">
                              <select
                                value={banner.isActive ? "active" : "inactive"}
                                onChange={(event) =>
                                  updateBanner(banner.id, {
                                    isActive: event.target.value === "active",
                                  })
                                }
                                className={inputClass}
                              >
                                <option value="active">Active</option>

                                <option value="inactive">Inactive</option>
                              </select>
                            </LightField>
                          </div>

                          <LightField label="Upload banner image">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(event) =>
                                selectBannerFile(
                                  banner.id,
                                  event.target.files?.[0],
                                )
                              }
                              className="block w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-700 file:mr-4 file:rounded-lg file:border-0 file:bg-orange-50 file:px-4 file:py-2 file:text-xs file:font-bold file:text-orange-600"
                            />
                          </LightField>

                          <LightField label="Or banner image URL">
                            <input
                              type="text"
                              value={banner.imageUrl}
                              onChange={(event) =>
                                updateBanner(banner.id, {
                                  imageUrl: event.target.value,
                                })
                              }
                              placeholder="/banners/banner.png or https://..."
                              className={inputClass}
                            />
                          </LightField>
                          <LightField label="Banner destination URL">
                            <input
                              type="text"
                              value={banner.linkUrl ?? ""}
                              onChange={(event) =>
                                updateBanner(banner.id, {
                                  linkUrl: event.target.value,
                                })
                              }
                              placeholder="/products/product-slug or /categories/category-slug"
                              className={inputClass}
                            />

                            <p className="mt-2 text-xs leading-5 text-zinc-400">
                              Optional. Customers will be redirected here when
                              they click this banner.
                            </p>
                          </LightField>

                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <span
                              className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                                banner.isActive
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-zinc-200 text-zinc-600"
                              }`}
                            >
                              {banner.isActive ? "Active" : "Inactive"}
                            </span>

                            <button
                              type="button"
                              onClick={() => {
                                const confirmed = window.confirm(
                                  "Remove this homepage banner?",
                                );

                                if (confirmed) {
                                  removeBanner(banner.id);
                                }
                              }}
                              className="rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-bold text-red-600 transition hover:bg-red-50"
                            >
                              Remove Banner
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>

            {settings.bannerSlides.length === 0 ? (
              <div className="mt-5 rounded-xl border border-dashed border-zinc-200 bg-zinc-50 px-4 py-8 text-center">
                <p className="text-sm font-bold text-zinc-500">
                  No homepage banners.
                </p>

                <p className="mt-1 text-xs text-zinc-400">
                  Click Add Banner to create one.
                </p>
              </div>
            ) : null}
          </SettingsCard>

          <SettingsCard
            title="New Arrivals"
            description="Automatically displays the newest active products. No manual selection is required."
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-zinc-900">
                  Automatic merchandising
                </p>

                <p className="mt-1 text-xs leading-5 text-zinc-500">
                  The newest 8 active products are shown automatically as you
                  add products to the catalog.
                </p>
              </div>

              <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                Automatic
              </span>
            </div>

            <ProductPreviewGrid products={newArrivals} />
          </SettingsCard>
          <CategorySelector
            selectedSlugs={settings.homepageCategorySlugs}
            categories={activeCategories}
            maxSelect={6}
            onChange={(slugs) => updateField("homepageCategorySlugs", slugs)}
          />
          <div className="grid gap-6 2xl:grid-cols-2">
            <MerchandisingSelector
              title="Best Sellers"
              description="Choose products you want to present as customer favourites. Keep this manual until sales-based ranking is introduced."
              selectedSlugs={settings.bestSellerSlugs}
              products={activeProducts}
              maxSelect={8}
              onChange={(slugs) => updateField("bestSellerSlugs", slugs)}
            />

            <MerchandisingSelector
              title="Featured Products"
              description="Handpick products you want to promote prominently on the homepage."
              selectedSlugs={settings.featuredSlugs}
              products={activeProducts}
              maxSelect={8}
              onChange={(slugs) => updateField("featuredSlugs", slugs)}
            />
          </div>

          <div className="sticky bottom-0 z-20 flex justify-end border-t border-zinc-200 bg-white/95 py-4 backdrop-blur">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex min-w-48 items-center justify-center rounded-xl bg-orange-500 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? "Saving..." : "Save Homepage Settings"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

function CategorySelector({
  selectedSlugs,
  categories,
  maxSelect,
  onChange,
}: CategorySelectorProps) {
  const selectedCategories = useMemo(
    () =>
      selectedSlugs
        .map((slug) => categories.find((category) => category.slug === slug))
        .filter(Boolean) as Category[],
    [categories, selectedSlugs],
  );

  const availableCategories = useMemo(
    () =>
      categories.filter((category) => !selectedSlugs.includes(category.slug)),
    [categories, selectedSlugs],
  );

  function addCategory(slug: string) {
    if (selectedSlugs.includes(slug) || selectedSlugs.length >= maxSelect) {
      return;
    }

    onChange([...selectedSlugs, slug]);
  }

  function removeCategory(slug: string) {
    onChange(selectedSlugs.filter((selectedSlug) => selectedSlug !== slug));
  }

  function moveCategory(slug: string, direction: -1 | 1) {
    const currentIndex = selectedSlugs.indexOf(slug);

    if (currentIndex < 0) {
      return;
    }

    const nextIndex = currentIndex + direction;

    if (nextIndex < 0 || nextIndex >= selectedSlugs.length) {
      return;
    }

    const next = [...selectedSlugs];
    const [moved] = next.splice(currentIndex, 1);

    next.splice(nextIndex, 0, moved);

    onChange(next);
  }

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-zinc-100 pb-4">
        <div className="max-w-2xl">
          <h2 className="text-lg font-bold text-zinc-950">
            Homepage Categories
          </h2>

          <p className="mt-1 text-sm leading-6 text-zinc-500">
            Choose up to 6 categories to feature prominently on the storefront.
            Their order here controls their homepage order.
          </p>
        </div>

        <span className="rounded-full bg-zinc-100 px-3 py-1.5 text-xs font-bold text-zinc-600">
          {selectedSlugs.length}/{maxSelect} selected
        </span>
      </div>

      <div className="pt-5">
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-zinc-400">
          Selected Categories
        </p>

        {selectedCategories.length ? (
          <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {selectedCategories.map((category, index) => (
              <div
                key={category.slug}
                className="rounded-xl border border-orange-100 bg-orange-50/40 p-4"
              >
                <div className="flex items-start gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-xs font-black text-orange-600 shadow-sm">
                    {index + 1}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-zinc-900">
                      {category.name}
                    </p>

                    <p className="mt-1 truncate text-xs text-zinc-500">
                      /categories/{category.slug}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => moveCategory(category.slug, -1)}
                    className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-bold text-zinc-600 transition hover:border-orange-200 hover:text-orange-600 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    ↑
                  </button>

                  <button
                    type="button"
                    disabled={index === selectedCategories.length - 1}
                    onClick={() => moveCategory(category.slug, 1)}
                    className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-bold text-zinc-600 transition hover:border-orange-200 hover:text-orange-600 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    ↓
                  </button>

                  <button
                    type="button"
                    onClick={() => removeCategory(category.slug)}
                    className="ml-auto rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-bold text-zinc-600 transition hover:border-red-200 hover:text-red-600"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-3 rounded-xl border border-dashed border-zinc-200 bg-zinc-50 px-4 py-6 text-center">
            <p className="text-sm font-bold text-zinc-500">
              No categories selected yet.
            </p>

            <p className="mt-1 text-xs text-zinc-400">
              Choose categories below to feature them on the homepage.
            </p>
          </div>
        )}
      </div>

      <div className="mt-6 border-t border-zinc-100 pt-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-zinc-400">
            Available Categories
          </p>

          {selectedSlugs.length >= maxSelect ? (
            <span className="text-xs font-semibold text-orange-600">
              Maximum {maxSelect} selected
            </span>
          ) : null}
        </div>

        {availableCategories.length ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {availableCategories.map((category) => (
              <button
                key={category.slug}
                type="button"
                disabled={selectedSlugs.length >= maxSelect}
                onClick={() => addCategory(category.slug)}
                className="rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                + {category.name}
              </button>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-zinc-400">
            All active categories are already selected.
          </p>
        )}
      </div>
    </section>
  );
}

function MerchandisingSelector({
  title,
  description,
  selectedSlugs,
  products,
  maxSelect,
  onChange,
}: MerchandisingSelectorProps) {
  const [query, setQuery] = useState("");

  const selectedProducts = useMemo(
    () =>
      selectedSlugs
        .map((slug) => products.find((product) => product.slug === slug))
        .filter(Boolean) as Product[],
    [products, selectedSlugs],
  );

  const availableProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return products
      .filter((product) => !selectedSlugs.includes(product.slug))
      .filter((product) => {
        if (!normalizedQuery) {
          return false;
        }

        return (
          product.name.toLowerCase().includes(normalizedQuery) ||
          product.categorySlug.toLowerCase().includes(normalizedQuery) ||
          (product.sku ?? "").toLowerCase().includes(normalizedQuery) ||
          (product.brand ?? "").toLowerCase().includes(normalizedQuery)
        );
      })
      .slice(0, 12);
  }, [products, query, selectedSlugs]);

  function addProduct(slug: string) {
    if (selectedSlugs.includes(slug) || selectedSlugs.length >= maxSelect) {
      return;
    }

    onChange([...selectedSlugs, slug]);
  }

  function removeProduct(slug: string) {
    onChange(selectedSlugs.filter((selectedSlug) => selectedSlug !== slug));
  }

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-zinc-100 pb-4">
        <div className="max-w-xl">
          <h2 className="text-lg font-bold text-zinc-950">{title}</h2>

          <p className="mt-1 text-sm leading-6 text-zinc-500">{description}</p>
        </div>

        <span className="rounded-full bg-zinc-100 px-3 py-1.5 text-xs font-bold text-zinc-600">
          {selectedSlugs.length}/{maxSelect} selected
        </span>
      </div>

      <div className="pt-5">
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-zinc-400">
          Selected Products
        </p>

        {selectedProducts.length ? (
          <div className="mt-3 space-y-2">
            {selectedProducts.map((product, index) => (
              <div
                key={product.slug}
                className="flex items-center gap-3 rounded-xl border border-orange-100 bg-orange-50/40 p-3"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-xs font-black text-orange-600 shadow-sm">
                  {index + 1}
                </span>

                <ProductThumbnail product={product} />

                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 text-sm font-bold text-zinc-900">
                    {product.name}
                  </p>

                  <p className="mt-0.5 text-xs text-zinc-500">
                    {formatCategory(product.categorySlug)} · AED {product.price}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => removeProduct(product.slug)}
                  className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-bold text-zinc-600 transition hover:border-red-200 hover:text-red-600"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-3 rounded-xl border border-dashed border-zinc-200 bg-zinc-50 px-4 py-5 text-center">
            <p className="text-sm font-semibold text-zinc-500">
              No products selected yet.
            </p>
          </div>
        )}

        <div className="mt-6 border-t border-zinc-100 pt-5">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-zinc-400">
            Find Products
          </p>

          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search name, category, SKU or brand..."
            className={`${inputClass} mt-3`}
          />

          <div className="mt-3 max-h-[360px] space-y-2 overflow-y-auto pr-1">
            {availableProducts.map((product) => {
              const selectionFull = selectedSlugs.length >= maxSelect;

              return (
                <div
                  key={product.slug}
                  className="flex items-center gap-3 rounded-xl border border-zinc-200 p-3 transition hover:border-orange-200 hover:bg-orange-50/30"
                >
                  <ProductThumbnail product={product} />

                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 text-sm font-bold text-zinc-900">
                      {product.name}
                    </p>

                    <p className="mt-0.5 text-xs text-zinc-500">
                      {formatCategory(product.categorySlug)} · AED{" "}
                      {product.price}
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={selectionFull}
                    onClick={() => addProduct(product.slug)}
                    className="rounded-lg bg-zinc-950 px-3 py-2 text-xs font-bold text-white transition hover:bg-orange-500 disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:text-zinc-400"
                  >
                    Add
                  </button>
                </div>
              );
            })}

            {availableProducts.length === 0 ? (
              <div className="rounded-xl bg-zinc-50 px-4 py-5 text-center text-sm font-semibold text-zinc-400">
                {query.trim()
                  ? "No matching products."
                  : "Search to find products to add."}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

function ProductPreviewGrid({ products }: { products: Product[] }) {
  if (!products.length) {
    return (
      <div className="mt-5 rounded-xl border border-dashed border-zinc-200 bg-zinc-50 px-4 py-6 text-center text-sm font-semibold text-zinc-400">
        No active products available.
      </div>
    );
  }

  return (
    <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-8">
      {products.map((product) => (
        <div
          key={product.slug}
          className="min-w-0 rounded-xl border border-zinc-200 bg-zinc-50 p-3"
        >
          <div className="flex aspect-square items-center justify-center overflow-hidden rounded-lg bg-white">
            <Image
              src={product.imageUrl}
              alt={product.name}
              width={220}
              height={220}
              unoptimized
              className="h-full w-full object-contain p-2"
            />
          </div>

          <p className="mt-2 line-clamp-2 text-xs font-bold leading-5 text-zinc-800">
            {product.name}
          </p>

          <p className="mt-1 text-xs font-bold text-orange-600">
            AED {product.price}
          </p>
        </div>
      ))}
    </div>
  );
}

function ProductThumbnail({ product }: { product: Product }) {
  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-zinc-200 bg-white">
      <Image
        src={product.imageUrl}
        alt=""
        width={80}
        height={80}
        unoptimized
        className="h-full w-full object-contain p-1"
      />
    </div>
  );
}

function SettingsCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="border-b border-zinc-100 pb-4">
        <h2 className="text-lg font-bold text-zinc-950">{title}</h2>

        <p className="mt-1 text-sm leading-6 text-zinc-500">{description}</p>
      </div>

      <div className="pt-5">{children}</div>
    </section>
  );
}

function LightField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-zinc-700">
        {label}
      </span>

      {children}
    </label>
  );
}

function formatCategory(value: string) {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

const inputClass =
  "w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-orange-300 focus:bg-white";
