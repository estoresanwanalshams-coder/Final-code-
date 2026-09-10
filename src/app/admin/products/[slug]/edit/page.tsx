"use client";

import { useParams } from "next/navigation";
import { AdminProductEditor } from "@/components/AdminProductEditor";

export default function EditProductPage() {
  const params = useParams<{ slug: string }>();

  return (
    <AdminProductEditor
      productSlug={decodeURIComponent(params.slug)}
    />
  );
}