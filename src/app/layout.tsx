import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import { SiteChrome } from "@/components/SiteChrome";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ScrollToTopOnNavigate } from "@/components/ScrollToTopOnNavigate";
import "./globals.css";

const GA_MEASUREMENT_ID = "G-QH9FWLDZXS";
const META_PIXEL_ID = "1463226579045873";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.hmshoponline.com"),

  title: {
    default: "HM Shop Online | Trending Products & Everyday Essentials UAE",
    template: "%s | HM Shop Online",
  },

  description:
    "Shop trending products, home & kitchen essentials, gadgets, beauty, toys and everyday finds at HM Shop Online. Convenient UAE delivery with Cash on Delivery available.",

  keywords: [
    "HM Shop Online",
    "online shopping UAE",
    "UAE ecommerce",
    "Dubai online shopping",
    "trending products UAE",
    "home and kitchen UAE",
    "gadgets UAE",
    "beauty products UAE",
    "toys UAE",
    "cash on delivery UAE",
  ],

  openGraph: {
    title: "HM Shop Online",
    description:
      "Discover trending products and useful everyday essentials with convenient delivery across the UAE.",
    url: "https://hmshoponline.com",
    siteName: "HM Shop Online",
    type: "website",
    locale: "en_AE",
  },

  twitter: {
    card: "summary_large_image",
    title: "HM Shop Online",
    description:
      "Trending products and everyday essentials delivered across the UAE.",
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className={`${poppins.className} flex min-h-full flex-col`}>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}');
          `}
        </Script>
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', '${META_PIXEL_ID}');
    fbq('track', 'PageView');
  `}
        </Script>
        <ScrollToTopOnNavigate />
        <SiteChrome>{children}</SiteChrome>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
