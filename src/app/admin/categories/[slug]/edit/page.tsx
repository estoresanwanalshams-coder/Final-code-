"use client";

import { useParams } from "next/navigation";
import { AdminCategoryEditor } from "@/components/AdminCategoryEditor";

export default function EditCategoryPage() {
  const params = useParams<{ slug: string }>();

  return (
    <AdminCategoryEditor
      categorySlug={decodeURIComponent(params.slug)}
    />
  );
}