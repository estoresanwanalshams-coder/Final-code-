import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ClientFloatingWidgets } from "@/components/ClientFloatingWidgets";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { ScrollToTopOnNavigate } from "@/components/ScrollToTopOnNavigate";
import "./globals.css";

const GA_MEASUREMENT_ID = "G-QH9FWLDZXS";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "HM shop online",
    template: "%s | HM shop online",
  },
  description: "Shop curated products at HM shop online.",
  keywords: [
    "GCC ecommerce",
    "UAE online shopping",
    "Dubai general products",
    "home and kitchen UAE",
    "electronic gadgets GCC",
    "baby toys UAE",
    "automotive accessories Gulf",
    "health beauty products UAE",
  ],
  openGraph: {
    title: "HM shop online",
    description: "Responsive ecommerce store for curated products.",
    type: "website",
    locale: "en_AE",
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
        <ScrollToTopOnNavigate />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <ClientFloatingWidgets />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
