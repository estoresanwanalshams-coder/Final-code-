import { NextResponse } from "next/server";
import { canSendEmail, getOwnerEmail, sendMail } from "@/lib/mailer";

type OrderItem = {
  product: {
    name: string;
  };
  quantity: number;
};

type OrderNotifyPayload = {
  orderNumber: string;
  fullName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  total: number;
  items: OrderItem[];
};

function formatItems(items: OrderItem[]) {
  return items
    .map((item) => `- ${item.product.name} x ${item.quantity}`)
    .join("\n");
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as OrderNotifyPayload;

    if (!payload.email || !payload.orderNumber) {
      return NextResponse.json(
        { error: "Missing order email details." },
        { status: 400 },
      );
    }

    if (!canSendEmail()) {
      return NextResponse.json({ ok: true });
    }

    const itemsText = formatItems(payload.items ?? []);
    const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
    const isPublicSiteUrl =
      !!configuredSiteUrl && !/localhost|127\.0\.0\.1/i.test(configuredSiteUrl);
    const siteUrl = isPublicSiteUrl
      ? configuredSiteUrl
      : "https://www.hmshoponline.com";
    const trackUrl = `${siteUrl.replace(/\/$/, "")}/track-order`;
    const customerSubject = `Order ${payload.orderNumber} placed successfully`;
    const customerText =
      `Hi ${payload.fullName},\n\n` +
      `Your order ${payload.orderNumber} has been placed successfully.\n` +
      `Our team will contact you shortly.\n\n` +
      `You can track your order using your Order ID, email or phone number here:\n${trackUrl}\n\n` +
      `Please check your spam folder too for order details.\n\n` +
      `Order summary:\n${itemsText}\n\n` +
      `Total: AED ${payload.total}\n\n` +
      `Thanks for shopping with us.`;

    await sendMail({
      to: payload.email,
      subject: customerSubject,
      text: customerText,
    });

    const owner = getOwnerEmail();
    if (owner) {
      const ownerText =
        `New order received\n\n` +
        `Order: ${payload.orderNumber}\n` +
        `Customer: ${payload.fullName}\n` +
        `Email: ${payload.email}\n` +
        `Phone: ${payload.phone}\n` +
        `Address: ${payload.addressLine1}, ${payload.addressLine2}, ${payload.city}\n\n` +
        `Items:\n${itemsText}\n\n` +
        `Total: AED ${payload.total}`;

      await sendMail({
        to: owner,
        subject: `New order: ${payload.orderNumber}`,
        text: ownerText,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Unknown error";
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
