import { HomeBannerCarousel } from "@/components/HomeBannerCarousel";
import { HomeCategoryGrid } from "@/components/HomeCategoryGrid";
import { HomeProductCarousel } from "@/components/HomeProductCarousel";
import { HomeTrustSection } from "@/components/HomeTrustSection";
import { categories } from "@/lib/categories";
import type { Product } from "@/lib/products";
import { fetchMergedCategories } from "@/lib/supabase-categories";
import { fetchSupabaseProductsPage } from "@/lib/supabase-products";
import { defaultSiteSettings, fetchSiteSettings } from "@/lib/site-settings";

function pickProducts(sourceProducts: Product[], selectedSlugs: string[]) {
  if (selectedSlugs.length === 0 || sourceProducts.length === 0) {
    return [];
  }

  const selectedProducts = selectedSlugs
    .map((slug) => sourceProducts.find((product) => product.slug === slug))
    .filter(Boolean) as Product[];

  return selectedProducts.length > 0
    ? selectedProducts.slice(0, 8)
    : sourceProducts.slice(0, 8);
}

function getAutoNewArrivalSlugs(
  sourceProducts: Product[],
  selectedSlugs: string[],
) {
  const latestSlugs = sourceProducts.slice(0, 4).map((product) => product.slug);

  return Array.from(new Set([...latestSlugs, ...selectedSlugs])).slice(0, 8);
}

export async function HomePageContent() {
  const [settings, productsPage, categoryItems] = await Promise.all([
    fetchSiteSettings().catch(() => defaultSiteSettings),

    fetchSupabaseProductsPage({
      page: 1,
      pageSize: 60,
    }).catch(() => ({
      products: [],
      hasNextPage: false,
      totalPages: 1,
      currentPage: 1,
    })),

    fetchMergedCategories().catch(() => categories),
  ]);

  const productSource = productsPage.products;

  const newArrivals = pickProducts(
    productSource,
    getAutoNewArrivalSlugs(productSource, settings.newArrivalSlugs),
  );

  const bestSellers = pickProducts(productSource, settings.bestSellerSlugs);

  const featuredProducts = pickProducts(productSource, settings.featuredSlugs);

  const homepageCategories = categoryItems.filter((category) =>
    productSource.some((product) => product.categorySlug === category.slug),
  );

  const featuredCategorySections = homepageCategories
    .map((category) => ({
      category,
      products: productSource
        .filter((product) => product.categorySlug === category.slug)
        .slice(0, 8),
    }))
    .filter((section) => section.products.length > 0)
    .slice(0, 3);

  return (
    <section className="page-shell">
      <div className="mx-auto max-w-7xl px-4 pb-8 pt-2 sm:px-6 sm:pb-8 sm:pt-3 lg:px-8">
        <HomeBannerCarousel extraBannerUrl={settings.bannerImageUrl} />

        <HomeCategoryGrid categories={homepageCategories} />

        <HomeTrustSection />

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
