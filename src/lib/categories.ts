export type Category = {
  name: string;
  slug: string;
  description: string;
  imageUrl?: string;
  isActive?: boolean;
  displayOrder?: number;
};

export const categories: Category[] = [
  {
    name: "Home and Kitchen",
    slug: "home-and-kitchen",
    description:
      "Useful kitchen tools, dining basics, storage, and home essentials.",
    isActive: true,
    displayOrder: 1,
  },
  {
    name: "Electronic Gadgets",
    slug: "electronic-gadgets",
    description:
      "Smart accessories, compact tech, chargers, and everyday gadgets.",
    isActive: true,
    displayOrder: 2,
  },
  {
    name: "Baby & Toys",
    slug: "baby-toys",
    description:
      "Baby care items, playful toys, learning products, and gifting picks.",
    isActive: true,
    displayOrder: 3,
  },
  {
    name: "Automotive",
    slug: "automative",
    description:
      "Car accessories, maintenance helpers, organizers, and travel tools.",
    isActive: true,
    displayOrder: 4,
  },
  {
    name: "Health & Beauty",
    slug: "health-beauty",
    description:
      "Self-care, grooming, beauty tools, and wellness essentials.",
    isActive: true,
    displayOrder: 5,
  },
];

export type CategorySlug = string;

export function getCategoryBySlug(
  slug: string,
  categoryList: Category[] = categories,
) {
  return categoryList.find((category) => category.slug === slug);
}

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

  return Array.from(merged.values()).sort(
    (a, b) =>
      (a.displayOrder ?? 0) - (b.displayOrder ?? 0) ||
      a.name.localeCompare(b.name),
  );
}

export const adminCategoriesUpdatedEvent = "admin-categories:updated";