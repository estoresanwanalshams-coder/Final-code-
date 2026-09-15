import type { MetadataRoute } from "next";

const SITE_URL = "https://www.hmshoponline.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin/",
        "/api/",
        "/cart",
        "/checkout",
        "/inquiry/",
        "/login",
        "/register",
        "/profile",
        "/order-success",
        "/track-order",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}