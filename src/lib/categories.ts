export type Category = {
  name: string;
  slug: string;
  description: string;
};

export const categories: Category[] = [
  {
    name: "Home and Kitchen",
    slug: "home-and-kitchen",
    description: "Useful kitchen tools, dining basics, storage, and home essentials.",
  },
  {
    name: "Electronic Gadgets",
    slug: "electronic-gadgets",
    description: "Smart accessories, compact tech, chargers, and everyday gadgets.",
  },
  {
    name: "Baby & Toys",
    slug: "baby-toys",
    description: "Baby care items, playful toys, learning products, and gifting picks.",
  },
  {
    name: "Automative",
    slug: "automative",
    description: "Car accessories, maintenance helpers, organizers, and travel tools.",
  },
  {
    name: "Health & Beauty",
    slug: "health-beauty",
    description: "Self-care, grooming, beauty tools, and wellness essentials.",
  },
];


export type CategorySlug = string;

export function getCategoryBySlug(
  slug: string,
  categoryList: Category[] = categories,
) {
  return categoryList.find((category) => category.slug === slug);
}

/** Merges Supabase categories with built-in defaults (remote wins on slug conflict). */
export function mergeCategories(
  remoteCategories: Category[],
  localCategories: Category[] = [...categories],
): Category[] {
  const merged = new Map<string, Category>();

  for (const category of localCategories) {
    merged.set(category.slug, category);
  }

  for (const category of remoteCategories) {
    merged.set(category.slug, category);
  }

  return Array.from(merged.values());
}

export const adminCategoriesUpdatedEvent = "admin-categories:updated";
