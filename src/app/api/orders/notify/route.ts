import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { canSendEmail, getOwnerEmail, sendMail } from "@/lib/mailer";
import type { CartItem } from "@/lib/cart";

type OrderNotifyPayload = {
  orderNumber: string;
  email: string;
};

type StoredOrder = {
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
};

function formatItems(items: CartItem[]) {
  return items
    .map((item) => `- ${item.product.name} x ${item.quantity}`)
    .join("\n");
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as OrderNotifyPayload;

    const orderNumber = payload.orderNumber?.trim();
    const email = payload.email?.trim().toLowerCase();

    if (!orderNumber || !email) {
      return NextResponse.json(
        { error: "Missing order verification details." },
        { status: 400 },
      );
    }

    const supabaseAdmin = createSupabaseAdminClient();

    if (!supabaseAdmin) {
      console.error(
        "Order notify configuration error: SUPABASE_SERVICE_ROLE_KEY is missing.",
      );

      return NextResponse.json(
        { error: "Order notification service is not configured." },
        { status: 500 },
      );
    }

    const { data, error } = await supabaseAdmin
      .from("orders")
      .select(
        [
          "order_number",
          "full_name",
          "email",
          "phone",
          "address_line_1",
          "address_line_2",
          "city",
          "shipping_method",
          "additional_notes",
          "items",
          "total",
        ].join(","),
      )
      .eq("order_number", orderNumber)
      .eq("email", email)
      .limit(1)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      return NextResponse.json(
        { error: "Order could not be verified." },
        { status: 404 },
      );
    }

    const order = data as unknown as StoredOrder;

    if (!canSendEmail()) {
      return NextResponse.json({ ok: true });
    }

    const itemsText = formatItems(order.items ?? []);

    const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

    const isPublicSiteUrl =
      !!configuredSiteUrl &&
      !/localhost|127\.0\.0\.1/i.test(configuredSiteUrl);

    const siteUrl = isPublicSiteUrl
      ? configuredSiteUrl
      : "https://www.hmshoponline.com";

    const trackUrl =
      `${siteUrl.replace(/\/$/, "")}/track-order?order=` +
      encodeURIComponent(order.order_number);

    const customerSubject =
      `Order confirmed - ${order.order_number} | HM Shop Online`;

    const customerText =
      `Hi ${order.full_name},\n\n` +
      `Thank you for shopping with HM Shop Online.\n\n` +
      `Your order has been successfully placed.\n\n` +
      `ORDER NUMBER\n` +
      `${order.order_number}\n\n` +
      `PAYMENT\n` +
      `Cash on Delivery\n` +
      `No online payment is required. Please pay when your order arrives.\n\n` +
      `ORDER SUMMARY\n` +
      `${itemsText}\n\n` +
      `Order Total: AED ${order.total}\n\n` +
      `WHAT HAPPENS NEXT?\n` +
      `Our team will prepare your order and arrange delivery to your UAE address.\n\n` +
      `TRACK YOUR ORDER\n` +
      `${trackUrl}\n\n` +
      `For your privacy, you will also need to enter the email address or mobile number used when placing the order.\n\n` +
      `Please keep your order number until your order has been delivered.\n\n` +
      `Need help? Contact HM Shop Online support.\n\n` +
      `Thank you,\n` +
      `HM Shop Online\n` +
      `hmshoponline.com`;

    await sendMail({
      to: order.email,
      subject: customerSubject,
      text: customerText,
    });

    const owner = getOwnerEmail();

    if (owner) {
      const ownerText =
        `New order received\n\n` +
        `Order: ${order.order_number}\n` +
        `Customer: ${order.full_name}\n` +
        `Email: ${order.email}\n` +
        `Phone: ${order.phone}\n` +
        `Address: ${order.address_line_1}, ${order.address_line_2 ?? ""}, ${order.city}\n\n` +
        `Payment: Cash on Delivery\n\n` +
        `Items:\n${itemsText}\n\n` +
        `Total: AED ${order.total}`;

      await sendMail({
        to: owner,
        subject: `New order: ${order.order_number}`,
        text: ownerText,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const detail =
      error instanceof Error ? error.message : "Unknown error";

    console.error("Order notify email error:", error);

    return NextResponse.json(
      {
        error: "Unable to send order emails.",
        ...(process.env.NODE_ENV !== "production" ? { detail } : {}),
      },
      { status: 500 },
    );
  }
}