import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { isAdminEmail } from "@/lib/auth-role";
import { canSendEmail, getOwnerEmail, sendMail } from "@/lib/mailer";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

type StatusNotifyPayload = {
  orderNumber: string;
};

type StoredOrder = {
  order_number: string;
  full_name: string;
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
    const authHeader =
      request.headers.get("authorization");

    const token = authHeader
      ?.replace(/^Bearer\s+/i, "")
      .trim();

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

    const payload =
      (await request.json()) as StatusNotifyPayload;

    const orderNumber =
      payload.orderNumber?.trim();

    if (!orderNumber) {
      return NextResponse.json(
        {
          error:
            "Missing order number.",
        },
        { status: 400 },
      );
    }

    const supabaseAdmin =
      createSupabaseAdminClient();

    if (!supabaseAdmin) {
      console.error(
        "Order status notify configuration error: SUPABASE_SERVICE_ROLE_KEY is missing.",
      );

      return NextResponse.json(
        {
          error:
            "Order notification service is not configured.",
        },
        { status: 500 },
      );
    }

    const { data, error } =
      await supabaseAdmin
        .from("orders")
        .select(
          "order_number,full_name,email,status",
        )
        .eq(
          "order_number",
          orderNumber,
        )
        .limit(1)
        .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      return NextResponse.json(
        {
          error:
            "Order could not be verified.",
        },
        { status: 404 },
      );
    }

    const order =
      data as unknown as StoredOrder;

    if (!canSendEmail()) {
      return NextResponse.json({
        ok: true,
      });
    }

    const configuredSiteUrl =
      process.env.NEXT_PUBLIC_SITE_URL?.trim();

    const isPublicSiteUrl =
      !!configuredSiteUrl &&
      !/localhost|127\.0\.0\.1/i.test(
        configuredSiteUrl,
      );

    const siteUrl =
      isPublicSiteUrl
        ? configuredSiteUrl
        : "https://www.hmshoponline.com";

    const trackUrl =
      `${siteUrl.replace(
        /\/$/,
        "",
      )}/track-order?order=` +
      encodeURIComponent(
        order.order_number,
      );

    const customerStatus =
      getCustomerStatus(order.status);

    const customerText =
      `Hi ${order.full_name},\n\n` +
      `Here's an update on your HM Shop Online order.\n\n` +
      `ORDER NUMBER\n` +
      `${order.order_number}\n\n` +
      `CURRENT STATUS\n` +
      `${customerStatus.label}\n\n` +
      `${customerStatus.message}\n\n` +
      `TRACK YOUR ORDER\n` +
      `${trackUrl}\n\n` +
      `For your privacy, enter the email address or mobile number used when placing the order.\n\n` +
      `Need help? Contact HM Shop Online support.\n\n` +
      `Thank you,\n` +
      `HM Shop Online\n` +
      `hmshoponline.com`;

    await sendMail({
      to: order.email,
      subject:
        `${customerStatus.label} - ${order.order_number} | HM Shop Online`,
      text: customerText,
    });

    const owner =
      getOwnerEmail();

    if (owner) {
      await sendMail({
        to: owner,
        subject:
          `Order ${order.order_number} updated to ${customerStatus.label}`,
        text:
          `Order status updated by admin.\n\n` +
          `Order: ${order.order_number}\n` +
          `Customer: ${order.full_name}\n` +
          `Customer Email: ${order.email}\n` +
          `New Status: ${customerStatus.label}`,
      });
    }

    return NextResponse.json({
      ok: true,
    });
  } catch (error) {
    const detail =
      error instanceof Error
        ? error.message
        : "Unknown error";

    console.error(
      "Order status notify email error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Unable to send order status emails.",
        ...(process.env.NODE_ENV !==
        "production"
          ? { detail }
          : {}),
      },
      { status: 500 },
    );
  }
}