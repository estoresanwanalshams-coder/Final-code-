"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { getSafeRedirectPath } from "@/lib/auth-redirect";
import { isAdminEmail } from "@/lib/auth-role";
import { isValidPhoneNumber, normalizePhoneInput } from "@/lib/phone";
import { syncCustomerProfileForSession } from "@/lib/supabase-customers";
import { supabase } from "@/lib/supabase";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = getSafeRedirectPath(searchParams.get("redirect"));
  const loginHref =
    redirectTo === "/"
      ? "/login"
      : `/login?redirect=${encodeURIComponent(redirectTo)}`;

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");

    if (password.length < 6) {
      setMessage("Password must be at least 6 characters.");
      setIsSubmitting(false);
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Password and confirm password do not match.");
      setIsSubmitting(false);
      return;
    }

    if (!isValidPhoneNumber(phone)) {
      setMessage("Please enter a valid phone number (7 to 15 digits).");
      setIsSubmitting(false);
      return;
    }

    if (isAdminEmail(email)) {
      setMessage("Admin account cannot be created from customer register page.");
      setIsSubmitting(false);
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    const registerResponse = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: fullName.trim(),
        email: normalizedEmail,
        phone: phone.trim(),
        password,
      }),
    });

    const registerPayload = (await registerResponse.json().catch(() => null)) as
      | { error?: string }
      | null;

    if (!registerResponse.ok) {
      setMessage(registerPayload?.error ?? "Unable to create account.");
      setIsSubmitting(false);
      return;
    }

    const { data: signInData, error: signInError } =
      await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

    if (signInError || !signInData.session) {
      setMessage("Account created, but auto-login failed. Please login.");
      setIsSubmitting(false);
      return;
    }

    await syncCustomerProfileForSession({
      fullName: fullName.trim(),
      email: signInData.user.email ?? normalizedEmail,
      phone: phone.trim(),
    }).catch(() => null);

    setIsSubmitting(false);
    router.push(redirectTo);
    router.refresh();
  }

  return (
    <section className="page-shell">
      <div className="mx-auto flex min-h-[70vh] max-w-md items-center px-4 py-12">
        <form
          onSubmit={handleSubmit}
          className="w-full rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"
        >
          <p className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
            Create account
          </p>
          <h1 className="mt-2 text-3xl font-bold text-zinc-950">Register</h1>
          <div className="mt-6 space-y-4">
            <label className="light-form-field">
              Full Name
              <input
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                required
              />
            </label>
            <label className="light-form-field">
              Email
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </label>
            <label className="light-form-field">
              Phone
              <input
                type="tel"
                value={phone}
                onChange={(event) =>
                  setPhone(normalizePhoneInput(event.target.value))
                }
                inputMode="tel"
                pattern="[0-9+()\\-\\s]{7,20}"
                title="Enter a valid phone number (7 to 15 digits)"
                placeholder="+971 55 123 4567"
                required
              />
            </label>
            <label className="light-form-field">
              Password
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                minLength={6}
                required
              />
            </label>
            <label className="light-form-field">
              Confirm Password
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                minLength={6}
                required
              />
            </label>
          </div>
          {message ? (
            <p className="mt-4 text-sm font-semibold text-red-600">{message}</p>
          ) : null}
          <button
            disabled={isSubmitting}
            className="btn-soft mt-6 w-full justify-center disabled:opacity-60"
          >
            {isSubmitting ? "Creating..." : "Create Account"}
          </button>
          <p className="mt-4 text-sm text-zinc-600">
            Already have an account?{" "}
            <Link href={loginHref} className="font-semibold text-[#FF6B00]">
              Login
            </Link>
          </p>
        </form>
      </div>
    </section>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<section className="page-shell min-h-[70vh]" />}>
      <RegisterForm />
    </Suspense>
  );
}
