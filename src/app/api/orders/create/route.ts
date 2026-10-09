import { NextResponse } from "next/server";
import {
  getApplicableShippingCharge,
  isProductAvailableForPurchase,
  type CartItem,
} from "@/lib/cart";
import { isValidPhoneNumber } from "@/lib/phone";
import { defaultSiteSettings, fetchSiteSettings } from "@/lib/site-settings";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { fetchSupabaseProductBySlug } from "@/lib/supabase-products";

type CreateOrderItem = {
  slug?: string;
  quantity?: number;
};

type CreateOrderPayload = {
  fullName?: string;
  email?: string;
  phone?: string;
  emirate?: string;
  area?: string;
  building?: string;
  unit?: string;
  street?: string;
  landmark?: string;
  additionalNotes?: string;
  items?: CreateOrderItem[];
};

function buildAddress(payload: CreateOrderPayload) {
  const addressLine1 = [
    payload.building?.trim() ?? "",
    payload.unit?.trim() ? `Unit: ${payload.unit.trim()}` : "",
    payload.street?.trim() ?? "",
  ]
    .filter(Boolean)
    .join(", ");

  const addressLine2 = [
    payload.area?.trim() ?? "",
    payload.landmark?.trim() ? `Landmark: ${payload.landmark.trim()}` : "",
  ]
    .filter(Boolean)
    .join(", ");

  return { addressLine1, addressLine2 };
}

export async function POST(request: Request) {
  try {
    const supabaseAdmin = createSupabaseAdminClient();

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Order service is not configured." },
        { status: 503 },
      );
    }

    const payload = (await request.json()) as CreateOrderPayload;
    const fullName = payload.fullName?.trim() ?? "";
    const email = payload.email?.trim().toLowerCase() ?? "";
    const phone = payload.phone?.trim() ?? "";
    const emirate = payload.emirate?.trim() ?? "";
    const area = payload.area?.trim() ?? "";
    const building = payload.building?.trim() ?? "";

    if (!fullName || !email || !phone || !emirate || !area || !building) {
      return NextResponse.json(
        { error: "Please complete all required delivery details." },
        { status: 400 },
      );
    }

    if (!isValidPhoneNumber(phone)) {
      return NextResponse.json(
        { error: "Please enter a valid phone number (7 to 15 digits)." },
        { status: 400 },
      );
    }

    const requestedItems = (payload.items ?? [])
      .map((item) => ({
        slug: item.slug?.trim() ?? "",
        quantity: Math.max(1, Math.floor(Number(item.quantity) || 1)),
      }))
      .filter((item) => item.slug.length > 0);

    if (requestedItems.length === 0) {
      return NextResponse.json(
        { error: "Your cart is empty." },
        { status: 400 },
      );
    }

    const latestProducts = await Promise.all(
      requestedItems.map((item) => fetchSupabaseProductBySlug(item.slug)),
    );

    const unavailable = requestedItems.filter((item, index) => {
      const product = latestProducts[index];
      return !product || !isProductAvailableForPurchase(product);
    });

    if (unavailable.length > 0) {
      return NextResponse.json(
        {
          error: "Some products are no longer available.",
          unavailableSlugs: unavailable.map((item) => item.slug),
        },
        { status: 409 },
      );
    }

    const refreshedItems: CartItem[] = requestedItems.map((item, index) => ({
      product: latestProducts[index]!,
      quantity: item.quantity,
    }));

    const settings = await fetchSiteSettings().catch(() => defaultSiteSettings);
    const subtotal = refreshedItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0,
    );
    const shippingCharge = getApplicableShippingCharge(
      refreshedItems,
      settings.shippingCharge,
    );
    const total = subtotal + shippingCharge;
    const shippingMethod =
      shippingCharge === 0 && refreshedItems.length > 0
        ? "Free Shipping"
        : "Standard Shipping";

    const { data: orderNumber, error: orderNumberError } =
      await supabaseAdmin.rpc("next_order_number");

    if (orderNumberError || typeof orderNumber !== "string" || !orderNumber) {
      return NextResponse.json(
        { error: "Unable to generate order number." },
        { status: 500 },
      );
    }

    const { addressLine1, addressLine2 } = buildAddress(payload);

    const { error: insertError } = await supabaseAdmin.from("orders").insert({
      order_number: orderNumber,
      full_name: fullName,
      email,
      phone,
      address_line_1: addressLine1,
      address_line_2: addressLine2,
      city: emirate,
      shipping_method: shippingMethod,
      additional_notes: payload.additionalNotes?.trim() ?? "",
      items: refreshedItems,
      total,
    });

    if (insertError) {
      throw insertError;
    }

    return NextResponse.json({
      ok: true,
      orderNumber,
      total,
      shippingCharge,
      items: refreshedItems,
    });
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Unknown error";
    console.error("Create order error:", error);
    return NextResponse.json(
      {
        error: "Unable to place order.",
        ...(process.env.NODE_ENV !== "production" ? { detail } : {}),
      },
      { status: 500 },
    );
  }
}
