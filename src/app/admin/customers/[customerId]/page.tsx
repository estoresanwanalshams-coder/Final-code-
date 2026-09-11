"use client";

import { useParams } from "next/navigation";
import { AdminCustomerEditor } from "@/components/AdminCustomerEditor";

export default function AdminCustomerDetailPage() {
  const params =
    useParams<{
      customerId: string;
    }>();

  return (
    <AdminCustomerEditor
      customerId={decodeURIComponent(
        params.customerId,
      )}
    />
  );
}