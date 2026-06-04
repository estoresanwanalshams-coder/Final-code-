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

export async function syncCustomerProfileForSession(payload: {
  fullName: string;
  email: string;
  phone: string;
}) {
  const { error } = await supabase.rpc("upsert_customer_profile", {
    p_full_name: payload.fullName.trim(),
    p_email: payload.email.trim().toLowerCase(),
    p_phone: payload.phone.trim(),
  });

  if (error) {
    if (error.code === "42883") {
      return { ok: false as const, reason: "missing_rpc" as const };
    }
    throw error;
  }

  return { ok: true as const };
}

export async function createOrUpdateCustomerProfile(payload: {
  authUserId: string;
  fullName: string;
  email: string;
  phone: string;
}) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session?.user?.id === payload.authUserId) {
    return syncCustomerProfileForSession({
      fullName: payload.fullName,
      email: payload.email,
      phone: payload.phone,
    });
  }

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
    if (error.code === "42P01") {
      return { ok: false as const, reason: "missing_table" as const };
    }
    throw error;
  }

  return { ok: true as const };
}

export async function fetchCustomerProfileByAuthUserId(authUserId: string) {
  const { data, error } = await supabase
    .from("customers")
    .select("id, auth_user_id, full_name, email, phone, created_at")
    .eq("auth_user_id", authUserId)
    .maybeSingle();

  if (error) {
    if (error.code === "42P01") {
      return null;
    }
    throw error;
  }

  if (!data) {
    return null;
  }

  return mapCustomerRow(data as CustomerRow);
}

export async function fetchSupabaseCustomers() {
  const { data: rpcData, error: rpcError } = await supabase.rpc(
    "admin_list_customers",
  );

  if (!rpcError) {
    return ((rpcData as CustomerRow[] | null) ?? []).map((row) =>
      mapCustomerRow(row),
    );
  }

  if (rpcError.code !== "42883") {
    throw rpcError;
  }

  const { data, error } = await supabase
    .from("customers")
    .select("id, auth_user_id, full_name, email, phone, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return ((data ?? []) as CustomerRow[]).map((row) => mapCustomerRow(row));
}

export async function backfillCustomersFromAuth() {
  const { data, error } = await supabase.rpc("admin_backfill_customers");

  if (error) {
    throw error;
  }

  return Number(data ?? 0);
}

export async function createSupabaseCustomer(payload: {
  fullName: string;
  email: string;
  phone: string;
}) {
  const { data, error } = await supabase
    .from("customers")
    .insert({
      full_name: payload.fullName.trim(),
      email: payload.email.trim().toLowerCase(),
      phone: payload.phone.trim(),
    })
    .select("id, auth_user_id, full_name, email, phone, created_at")
    .single();

  if (error) {
    throw error;
  }

  return mapCustomerRow(data as CustomerRow);
}

export async function updateSupabaseCustomer(
  id: string,
  payload: {
    fullName: string;
    email: string;
    phone: string;
  },
) {
  const { data, error } = await supabase
    .from("customers")
    .update({
      full_name: payload.fullName.trim(),
      email: payload.email.trim().toLowerCase(),
      phone: payload.phone.trim(),
    })
    .eq("id", id)
    .select("id, auth_user_id, full_name, email, phone, created_at")
    .single();

  if (error) {
    throw error;
  }

  return mapCustomerRow(data as CustomerRow);
}

export async function deleteSupabaseCustomer(id: string) {
  const { error } = await supabase.from("customers").delete().eq("id", id);

  if (error) {
    throw error;
  }
}
