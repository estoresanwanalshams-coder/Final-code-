import { NextResponse } from "next/server";
import { canSendEmail, getOwnerEmail, sendMail } from "@/lib/mailer";

type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";

type StatusNotifyPayload = {
  orderNumber: string;
  fullName: string;
  email: string;
  status: OrderStatus;
};

function mapStatusText(status: OrderStatus) {
  switch (status) {
    case "processing":
      return "Your order is now in processing.";
    case "shipped":
      return "Your order has been shipped.";
    case "delivered":
      return "Your order has been marked as delivered.";
    case "cancelled":
      return "Your order has been cancelled.";
    default:
      return "Your order status was updated.";
  }
}

export async function POST(request: Request) {
  try {
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
    const trackUrl = `${siteUrl.replace(/\/$/, "")}/track-order`;
    const statusText = mapStatusText(payload.status);

    const customerText =
      `Hi ${payload.fullName},\n\n` +
      `${statusText}\n` +
      `Order ID: ${payload.orderNumber}\n\n` +
      `Track your order here:\n${trackUrl}\n\n` +
      `Thank you for shopping with us.`;

    await sendMail({
      to: payload.email,
      subject: `Order ${payload.orderNumber} status: ${payload.status}`,
      text: customerText,
    });

    const owner = getOwnerEmail();
    if (owner) {
      await sendMail({
        to: owner,
        subject: `Order ${payload.orderNumber} updated to ${payload.status}`,
        text:
          `Order status updated by admin.\n\n` +
          `Order ID: ${payload.orderNumber}\n` +
          `Customer: ${payload.fullName}\n` +
          `Customer Email: ${payload.email}\n` +
          `New Status: ${payload.status}`,
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
