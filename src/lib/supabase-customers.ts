import { supabase } from "@/lib/supabase";

export type CustomerRecord = {
  id: string;
  authUserId: string | null;
  fullName: string;
  email: string;
  phone: string;
  createdAt: string;
};

type CustomerRow = {
  id: string;
  auth_user_id: string | null;
  full_name: string;
  email: string;
  phone: string;
  created_at: string;
};

function mapCustomerRow(row: CustomerRow): CustomerRecord {
  return {
    id: row.id,
    authUserId: row.auth_user_id,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    createdAt: row.created_at,
  };
}

export async function createOrUpdateCustomerProfile(payload: {
  authUserId: string;
  fullName: string;
  email: string;
  phone: string;
}) {
  const { error } = await supabase.from("customers").upsert(
    {
      auth_user_id: payload.authUserId,
      full_name: payload.fullName.trim(),
      email: payload.email.trim().toLowerCase(),
      phone: payload.phone.trim(),
    },
    { onConflict: "auth_user_id" },
  );

  if (error) {
    // customers table not migrated yet
    if (error.code === "42P01") {
      return { ok: false as const, reason: "missing_table" as const };
    }
    throw error;
  }

  return { ok: true as const };
}

export async function fetchSupabaseCustomers() {
  const { data, error } = await supabase
    .from("customers")
    .select("id, auth_user_id, full_name, email, phone, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return ((data ?? []) as CustomerRow[]).map((row) => mapCustomerRow(row));
}
