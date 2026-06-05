import { NextResponse } from "next/server";
import { isAdminEmail } from "@/lib/auth-role";
import { isValidPhoneNumber } from "@/lib/phone";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

type RegisterPayload = {
  fullName?: string;
  email?: string;
  phone?: string;
  password?: string;
};

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as RegisterPayload;
    const fullName = payload.fullName?.trim() ?? "";
    const email = payload.email?.trim().toLowerCase() ?? "";
    const phone = payload.phone?.trim() ?? "";
    const password = payload.password ?? "";

    if (!fullName || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required." },
        { status: 400 },
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters." },
        { status: 400 },
      );
    }

    if (!isValidPhoneNumber(phone)) {
      return NextResponse.json(
        { error: "Please enter a valid phone number (7 to 15 digits)." },
        { status: 400 },
      );
    }

    if (isAdminEmail(email)) {
      return NextResponse.json(
        { error: "Admin account cannot be created from customer register page." },
        { status: 400 },
      );
    }

    const supabaseAdmin = createSupabaseAdminClient();
    if (!supabaseAdmin) {
      return NextResponse.json(
        {
          error:
            "Server registration is not configured. Add SUPABASE_SERVICE_ROLE_KEY to environment variables.",
        },
        { status: 500 },
      );
    }

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        phone,
      },
    });

    if (error) {
      const normalized = error.message.toLowerCase();
      if (normalized.includes("already") || normalized.includes("registered")) {
        return NextResponse.json(
          { error: "An account with this email already exists. Please login." },
          { status: 409 },
        );
      }

      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (!data.user) {
      return NextResponse.json(
        { error: "Unable to create account." },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true, email });
  } catch {
    return NextResponse.json(
      { error: "Unable to create account right now." },
      { status: 500 },
    );
  }
}
