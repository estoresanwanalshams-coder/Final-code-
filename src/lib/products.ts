import type { CategorySlug } from "@/lib/categories";

export type Product = {
  id?: string;
  name: string;
  slug: string;
  categorySlug: CategorySlug;
  actualPrice?: number;
  price: number;
  summary: string;
  details: string;
  imageUrl: string;
  imageUrls?: string[];
  videoUrl?: string;
};

const categoryImages = {
  kitchen:
    "https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=900&q=80",
  electronics:
    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80",
  baby:
    "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=900&q=80",
  automotive:
    "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=900&q=80",
  beauty:
    "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=900&q=80",
};

export const products: Product[] = [
  {
    name: "Premium Storage Set",
    slug: "premium-storage-set",
    categorySlug: "home-and-kitchen",
    price: 89,
    summary: "Stackable containers for a cleaner kitchen counter and pantry.",
    details: "A practical storage set designed for daily home organization, gifting, and bulk household use.",
    imageUrl: categoryImages.kitchen,
    imageUrls: [categoryImages.kitchen],
  },
  {
    name: "Compact Spice Organizer",
    slug: "compact-spice-organizer",
    categorySlug: "home-and-kitchen",
    price: 59,
    summary: "A neat rotating organizer for spices, jars, and cooking essentials.",
    details: "Keeps everyday kitchen items visible and easy to access without taking over shelf space.",
    imageUrl: categoryImages.kitchen,
    imageUrls: [categoryImages.kitchen],
  },
  {
    name: "Dining Serve Tray",
    slug: "dining-serve-tray",
    categorySlug: "home-and-kitchen",
    price: 72,
    summary: "Elegant serving tray for tea, snacks, breakfast, and hosting.",
    details: "A simple home essential with a premium look for everyday serving and occasional gatherings.",
    imageUrl: categoryImages.kitchen,
    imageUrls: [categoryImages.kitchen],
  },
  {
    name: "Fast Charging Hub",
    slug: "fast-charging-hub",
    categorySlug: "electronic-gadgets",
    price: 119,
    summary: "Multi-device charging hub for phones, watches, and accessories.",
    details: "A compact charging station built for desks, bedside tables, and travel setups.",
    imageUrl: categoryImages.electronics,
    imageUrls: [categoryImages.electronics],
  },
  {
    name: "Wireless Earbuds Case",
    slug: "wireless-earbuds-case",
    categorySlug: "electronic-gadgets",
    price: 45,
    summary: "Protective case for keeping earbuds safe and easy to carry.",
    details: "Lightweight accessory protection with a clean everyday style.",
    imageUrl: categoryImages.electronics,
    imageUrls: [categoryImages.electronics],
  },
  {
    name: "Portable LED Lamp",
    slug: "portable-led-lamp",
    categorySlug: "electronic-gadgets",
    price: 68,
    summary: "Rechargeable lamp for study tables, travel, and emergency use.",
    details: "A bright, portable lighting solution for home, office, and outdoor convenience.",
    imageUrl: categoryImages.electronics,
    imageUrls: [categoryImages.electronics],
  },
  {
    name: "Soft Baby Play Mat",
    slug: "soft-baby-play-mat",
    categorySlug: "baby-toys",
    price: 135,
    summary: "Comfortable play mat for crawling, tummy time, and safe play.",
    details: "Soft surface support for babies and toddlers with a family-friendly design.",
    imageUrl: categoryImages.baby,
    imageUrls: [categoryImages.baby],
  },
  {
    name: "Learning Blocks Kit",
    slug: "learning-blocks-kit",
    categorySlug: "baby-toys",
    price: 79,
    summary: "Colorful blocks for early learning, stacking, and play routines.",
    details: "A playful toy set for developing recognition, coordination, and creative building.",
    imageUrl: categoryImages.baby,
    imageUrls: [categoryImages.baby],
  },
  {
    name: "Baby Care Organizer",
    slug: "baby-care-organizer",
    categorySlug: "baby-toys",
    price: 99,
    summary: "Portable organizer for diapers, wipes, bottles, and baby items.",
    details: "Keeps baby care essentials tidy at home and simple to carry while traveling.",
    imageUrl: categoryImages.baby,
    imageUrls: [categoryImages.baby],
  },
  {
    name: "Car Seat Gap Filler",
    slug: "car-seat-gap-filler",
    categorySlug: "automative",
    price: 39,
    summary: "Prevents small items from falling between car seats.",
    details: "A useful car accessory for improving cabin organization and daily driving comfort.",
    imageUrl: categoryImages.automotive,
    imageUrls: [categoryImages.automotive],
  },
  {
    name: "Dashboard Phone Holder",
    slug: "dashboard-phone-holder",
    categorySlug: "automative",
    price: 55,
    summary: "Stable holder for hands-free phone viewing while driving.",
    details: "Designed for easy installation, stable grip, and quick phone access.",
    imageUrl: categoryImages.automotive,
    imageUrls: [categoryImages.automotive],
  },
  {
    name: "Car Trunk Organizer",
    slug: "car-trunk-organizer",
    categorySlug: "automative",
    price: 110,
    summary: "Foldable organizer for tools, groceries, and travel accessories.",
    details: "A durable storage helper for keeping car trunks clean and ready for trips.",
    imageUrl: categoryImages.automotive,
    imageUrls: [categoryImages.automotive],
  },
  {
    name: "Facial Cleansing Brush",
    slug: "facial-cleansing-brush",
    categorySlug: "health-beauty",
    price: 85,
    summary: "Gentle cleansing brush for daily skincare routines.",
    details: "Supports a polished personal care routine with simple, easy-to-use cleansing action.",
    imageUrl: categoryImages.beauty,
    imageUrls: [categoryImages.beauty],
  },
  {
    name: "Travel Grooming Kit",
    slug: "travel-grooming-kit",
    categorySlug: "health-beauty",
    price: 69,
    summary: "Compact grooming tools packed for home, office, and travel.",
    details: "A convenient kit for neat grooming routines and gifting.",
    imageUrl: categoryImages.beauty,
    imageUrls: [categoryImages.beauty],
  },
  {
    name: "Wellness Massage Roller",
    slug: "wellness-massage-roller",
    categorySlug: "health-beauty",
    price: 49,
    summary: "Easy handheld roller for relaxation and daily self-care.",
    details: "A lightweight wellness tool for gentle massage after long workdays or workouts.",
    imageUrl: categoryImages.beauty,
    imageUrls: [categoryImages.beauty],
  },
];

export function getProductBySlug(slug: string) {
  return products.find((product) => product.slug === slug);
}

export function getProductsByCategory(categorySlug: CategorySlug) {
  return products.filter((product) => product.categorySlug === categorySlug);
}
