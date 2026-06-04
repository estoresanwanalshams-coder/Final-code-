import { Suspense } from "react";
import { HomePageContent } from "@/components/HomePageContent";
import { ProductGridSkeleton } from "@/components/ProductGridSkeleton";

export const revalidate = 120;

export default function Home() {
  return (
    <Suspense fallback={<ProductGridSkeleton count={8} />}>
      <HomePageContent />
    </Suspense>
  );
}
