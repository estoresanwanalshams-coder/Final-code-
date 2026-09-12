import { HomeBannerCarousel } from "@/components/HomeBannerCarousel";
import { HomeCategoryGrid } from "@/components/HomeCategoryGrid";
import { HomeProductCarousel } from "@/components/HomeProductCarousel";
import { HomeTrustSection } from "@/components/HomeTrustSection";
import { categories } from "@/lib/categories";
import type { Product } from "@/lib/products";
import { fetchMergedCategories } from "@/lib/supabase-categories";
import { fetchSupabaseProducts } from "@/lib/supabase-products";
import { defaultSiteSettings, fetchSiteSettings } from "@/lib/site-settings";

function pickProducts(sourceProducts: Product[], selectedSlugs: string[]) {
  if (selectedSlugs.length === 0 || sourceProducts.length === 0) {
    return [];
  }

  return selectedSlugs
    .map((slug) => sourceProducts.find((product) => product.slug === slug))
    .filter(Boolean)
    .slice(0, 8) as Product[];
}

export async function HomePageContent() {
  const [settings, productSource, categoryItems] = await Promise.all([
    fetchSiteSettings().catch(() => defaultSiteSettings),

    fetchSupabaseProducts().catch(() => []),

    fetchMergedCategories().catch(() => categories),
  ]);

  const newArrivals = productSource.slice(0, 8);

  const bestSellers = pickProducts(productSource, settings.bestSellerSlugs);

  const featuredProducts = pickProducts(productSource, settings.featuredSlugs);

  const eligibleCategories = categoryItems.filter((category) =>
    productSource.some((product) => product.categorySlug === category.slug),
  );

  const selectedHomepageCategories =
    settings.homepageCategorySlugs.length > 0
      ? settings.homepageCategorySlugs
          .map((slug) =>
            eligibleCategories.find((category) => category.slug === slug),
          )
          .filter(
            (category): category is (typeof eligibleCategories)[number] =>
              category !== undefined,
          )
      : eligibleCategories;

  const homepageCategories = selectedHomepageCategories.slice(0, 6);

  const featuredCategorySections = homepageCategories
    .slice(0, 3)
    .map((category) => ({
      category,
      products: productSource
        .filter((product) => product.categorySlug === category.slug)
        .slice(0, 8),
    }))
    .filter((section) => section.products.length > 0);

  return (
    <section className="page-shell">
      <div className="mx-auto max-w-7xl px-4 pb-8 pt-2 sm:px-6 sm:pb-8 sm:pt-3 lg:px-8">
        <HomeBannerCarousel banners={settings.bannerSlides} />

        <HomeCategoryGrid categories={homepageCategories} />

        <HomeProductCarousel
          eyebrow="Just In"
          title="New Arrivals"
          description="Fresh products recently added to HM Shop Online."
          linkLabel="View All Products"
          href="/products"
          products={newArrivals}
        />

        <HomeProductCarousel
          eyebrow="Popular Picks"
          title="Best Sellers"
          description="Customer favourites and useful everyday finds worth discovering."
          linkLabel="Shop Best Sellers"
          href="/products"
          products={bestSellers}
          tone="soft"
        />

        <HomeTrustSection />

        <HomeProductCarousel
          eyebrow="HM Picks"
          title="Featured Products"
          description="Handpicked products we think deserve a closer look."
          linkLabel="View All Products"
          href="/products"
          products={featuredProducts}
        />

        {featuredCategorySections.map(({ category, products }) => (
          <HomeProductCarousel
            key={category.slug}
            eyebrow="Shop the Department"
            title={category.name}
            linkLabel="View Category"
            href={`/categories/${category.slug}`}
            products={products}
          />
        ))}
      </div>
    </section>
  );
}
