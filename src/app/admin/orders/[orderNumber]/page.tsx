"use client";

import { useParams } from "next/navigation";
import { AdminOrderEditor } from "@/components/AdminOrderEditor";

export default function AdminOrderDetailPage() {
  const params =
    useParams<{
      orderNumber: string;
    }>();

  return (
    <AdminOrderEditor
      orderNumber={decodeURIComponent(
        params.orderNumber,
      )}
    />
  );
}