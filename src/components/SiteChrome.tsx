"use client";

import { usePathname } from "next/navigation";
import { ClientFloatingWidgets } from "@/components/ClientFloatingWidgets";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

export function SiteChrome({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    return <main className="flex-1">{children}</main>;
  }

  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <ClientFloatingWidgets />
    </>
  );
}