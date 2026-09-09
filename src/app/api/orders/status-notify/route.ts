import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { isAdminEmail } from "@/lib/auth-role";
import { canSendEmail, getOwnerEmail, sendMail } from "@/lib/mailer";

type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

type StatusNotifyPayload = {
  orderNumber: string;
  fullName: string;
  email: string;
  status: OrderStatus;
};

function getCustomerStatus(status: OrderStatus) {
  switch (status) {
    case "pending":
      return {
        label: "Order Placed",
        message:
          "We have received your order and it is waiting to be processed.",
      };

    case "processing":
      return {
        label: "Processing",
        message:
          "Your order is now being prepared for delivery.",
      };

    case "shipped":
      return {
        label: "Shipped",
        message:
          "Your order is on the way. Please keep your mobile number reachable for delivery.",
      };

    case "delivered":
      return {
        label: "Delivered",
        message:
          "Your order has been marked as delivered. We hope you enjoy your purchase.",
      };

    case "cancelled":
      return {
        label: "Cancelled",
        message:
          "Your order has been cancelled. Please contact us if you need assistance.",
      };
  }
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace(/^Bearer\s+/i, "").trim();

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    );

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (
      authError ||
      !user?.email ||
      !isAdminEmail(user.email)
    ) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }
    const payload = (await request.json()) as StatusNotifyPayload;

    if (!payload.email || !payload.orderNumber || !payload.status) {
      return NextResponse.json(
        { error: "Missing order status email details." },
        { status: 400 },
      );
    }

    if (!canSendEmail()) {
      return NextResponse.json({ ok: true });
    }

    const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

    const isPublicSiteUrl =
      !!configuredSiteUrl && !/localhost|127\.0\.0\.1/i.test(configuredSiteUrl);

    const siteUrl = isPublicSiteUrl
      ? configuredSiteUrl
      : "https://www.hmshoponline.com";

    const trackUrl =
      `${siteUrl.replace(/\/$/, "")}/track-order?order=` +
      encodeURIComponent(payload.orderNumber);

    const customerStatus = getCustomerStatus(payload.status);

    const customerText =
      `Hi ${payload.fullName},\n\n` +
      `Here's an update on your HM Shop Online order.\n\n` +
      `ORDER NUMBER\n` +
      `${payload.orderNumber}\n\n` +
      `CURRENT STATUS\n` +
      `${customerStatus.label}\n\n` +
      `${customerStatus.message}\n\n` +
      `TRACK YOUR ORDER\n` +
      `${trackUrl}\n\n` +
      `For your privacy, enter the email address or mobile number used when placing the order.\n\n` +
      `Need help? Reply to this email or contact HM Shop Online support.\n\n` +
      `Thank you,\n` +
      `HM Shop Online\n` +
      `hmshoponline.com`;

    await sendMail({
      to: payload.email,
      subject: `${customerStatus.label} - ${payload.orderNumber} | HM Shop Online`,
      text: customerText,
    });

    const owner = getOwnerEmail();

    if (owner) {
      await sendMail({
        to: owner,
        subject: `Order ${payload.orderNumber} updated to ${customerStatus.label}`,
        text:
          `Order status updated by admin.\n\n` +
          `Order: ${payload.orderNumber}\n` +
          `Customer: ${payload.fullName}\n` +
          `Customer Email: ${payload.email}\n` +
          `New Status: ${customerStatus.label}`,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Unknown error";

    console.error("Order status notify email error:", error);

    return NextResponse.json(
      {
        error: "Unable to send order status emails.",
        ...(process.env.NODE_ENV !== "production" ? { detail } : {}),
      },
      { status: 500 },
    );
  }
}