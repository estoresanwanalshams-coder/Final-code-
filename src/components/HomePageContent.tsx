import { HomeBannerCarousel } from "@/components/HomeBannerCarousel";
import { HomeProductCarousel } from "@/components/HomeProductCarousel";
import { categories } from "@/lib/categories";
import type { Product } from "@/lib/products";
import { fetchMergedCategories } from "@/lib/supabase-categories";
import { fetchSupabaseProductsPage } from "@/lib/supabase-products";
import {
  defaultSiteSettings,
  fetchSiteSettings,
} from "@/lib/site-settings";

function pickProducts(
  sourceProducts: Product[],
  selectedSlugs: string[],
) {
  if (selectedSlugs.length === 0 || sourceProducts.length === 0) {
    return [];
  }

  const selectedProducts = selectedSlugs
    .map((slug) =>
      sourceProducts.find((product) => product.slug === slug),
    )
    .filter(Boolean) as Product[];

  return selectedProducts.length > 0
    ? selectedProducts.slice(0, 8)
    : sourceProducts.slice(0, 8);
}

function getAutoNewArrivalSlugs(
  sourceProducts: Product[],
  selectedSlugs: string[],
) {
  const latestSlugs = sourceProducts
    .slice(0, 4)
    .map((product) => product.slug);

  return Array.from(
    new Set([...latestSlugs, ...selectedSlugs]),
  ).slice(0, 8);
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
    getAutoNewArrivalSlugs(
      productSource,
      settings.newArrivalSlugs,
    ),
  );

  const bestSellers = pickProducts(
    productSource,
    settings.bestSellerSlugs,
  );

  const featuredProducts = pickProducts(
    productSource,
    settings.featuredSlugs,
  );

  return (
    <section className="page-shell">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <HomeBannerCarousel
          extraBannerUrl={settings.bannerImageUrl}
        />

        <HomeProductCarousel
          title="New Arrivals"
          linkLabel="View All Products"
          href="/products"
          products={newArrivals}
        />

        <HomeProductCarousel
          title="Best Sellers"
          linkLabel="Browse Categories"
          href="/categories"
          products={bestSellers}
        />

        <HomeProductCarousel
          title="Featured Products"
          linkLabel="Shop Featured"
          href="/products"
          products={featuredProducts}
        />

        {categoryItems.map((category) => {
          const categoryProducts = productSource.filter(
            (product) =>
              product.categorySlug === category.slug,
          );

          if (categoryProducts.length === 0) {
            return null;
          }

          return (
            <HomeProductCarousel
              key={category.slug}
              title={category.name}
              linkLabel="View Category"
              href={`/categories/${category.slug}`}
              products={categoryProducts}
            />
          );
        })}
      </div>
    </section>
  );
}