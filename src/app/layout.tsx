import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { ClientFloatingWidgets } from "@/components/ClientFloatingWidgets";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import "./globals.css";

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
    <html
      lang="en"
      className="h-full antialiased"
      data-scroll-behavior="smooth"
    >
      <body className={`${poppins.className} flex min-h-full flex-col`}>
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <ClientFloatingWidgets />
      </body>
    </html>
  );
}
