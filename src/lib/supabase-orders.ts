import { supabase } from "@/lib/supabase";
import type { CartItem } from "@/lib/cart";

export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";

export type OrderPayload = {
  orderNumber: string;
  fullName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  shippingMethod?: string;
  additionalNotes?: string;
  items: CartItem[];
  total: number;
};

export type OrderRecord = OrderPayload & {
  id: string;
  status: OrderStatus;
  createdAt: string;
};

type OrderRow = {
  id: string;
  order_number: string;
  full_name: string;
  email: string;
  phone: string;
  address_line_1: string;
  address_line_2: string | null;
  city: string;
  shipping_method: string | null;
  additional_notes: string | null;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  created_at: string;
};

function mapOrderRow(row: OrderRow): OrderRecord {
  return {
    id: row.id,
    orderNumber: row.order_number,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    addressLine1: row.address_line_1,
    addressLine2: row.address_line_2 ?? "",
    city: row.city,
    shippingMethod: row.shipping_method ?? "Standard Shipping",
    additionalNotes: row.additional_notes ?? "",
    items: row.items,
    total: Number(row.total),
    status: row.status,
    createdAt: row.created_at,
  };
}

export function createOrderNumber() {
  return `ORD-${Date.now().toString(36).toUpperCase()}-${Math.floor(
    Math.random() * 900 + 100,
  )}`;
}

export async function createSupabaseOrder(order: OrderPayload) {
  const { error } = await supabase.from("orders").insert({
    order_number: order.orderNumber,
    full_name: order.fullName,
    email: order.email,
    phone: order.phone,
    address_line_1: order.addressLine1,
    address_line_2: order.addressLine2,
    city: order.city,
    shipping_method: order.shippingMethod ?? "Standard Shipping",
    additional_notes: order.additionalNotes ?? "",
    items: order.items,
    total: order.total,
  });

  if (error) {
    throw error;
  }
}

export async function fetchSupabaseOrders() {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => mapOrderRow(row as OrderRow));
}

export async function fetchSupabaseOrdersByEmail(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("email", normalizedEmail)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => mapOrderRow(row as OrderRow));
}

export async function fetchSupabaseOrdersByLookup(
  email: string,
  orderNumber: string,
) {
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedOrderNumber = orderNumber.trim();
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("email", normalizedEmail)
    .eq("order_number", normalizedOrderNumber)
    .order("created_at", { ascending: false })
    .limit(1);

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => mapOrderRow(row as OrderRow));
}

export async function fetchSupabaseOrdersByIdentifier(identifier: string) {
  const normalized = identifier.trim();
  if (!normalized) {
    return [];
  }

  // Use a security-definer RPC so guests (anon role) can track their own
  // orders by email / order number / phone without a blanket SELECT policy.
  const { data, error } = await supabase.rpc("track_order", {
    p_identifier: normalized,
  });

  if (error) {
    throw error;
  }

  return ((data as OrderRow[] | null) ?? []).map((row) => mapOrderRow(row));
}

export async function updateSupabaseOrderStatus(
  id: string,
  status: OrderStatus,
) {
  const { error } = await supabase.from("orders").update({ status }).eq("id", id);

  if (error) {
    throw error;
  }
}
