import { NextResponse } from "next/server";
import { canSendEmail, getOwnerEmail, sendMail } from "@/lib/mailer";

type ContactPayload = {
  name: string;
  email: string;
  phone: string;
  message: string;
};

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as ContactPayload;

    if (!payload.email || !payload.name || !payload.message) {
      return NextResponse.json(
        { error: "Missing contact form details." },
        { status: 400 },
      );
    }

    if (!canSendEmail()) {
      return NextResponse.json({ ok: true });
    }

    const customerText =
      `Hi ${payload.name},\n\n` +
      `Thanks for contacting us. Our team will get back to you shortly.\n\n` +
      `Regards,\nStorefront Team`;

    await sendMail({
      to: payload.email,
      subject: "We received your message",
      text: customerText,
    });

    const owner = getOwnerEmail();
    if (owner) {
      const ownerText =
        `New contact form submission\n\n` +
        `Name: ${payload.name}\n` +
        `Email: ${payload.email}\n` +
        `Phone: ${payload.phone}\n\n` +
        `Message:\n${payload.message}`;

      await sendMail({
        to: owner,
        subject: `New contact message from ${payload.name}`,
        text: ownerText,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Unknown error";
    console.error("Contact email error:", error);
    return NextResponse.json(
      {
        error: "Unable to send contact emails.",
        ...(process.env.NODE_ENV !== "production" ? { detail } : {}),
      },
      { status: 500 },
    );
  }
}
