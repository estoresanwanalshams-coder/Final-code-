"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { isAdminEmail } from "@/lib/auth-role";
import { createOrUpdateCustomerProfile } from "@/lib/supabase-customers";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  function mapLoginError(errorMessage?: string) {
    const normalized = (errorMessage ?? "").toLowerCase();
    if (
      normalized.includes("invalid login credentials") ||
      normalized.includes("invalid credentials")
    ) {
      return "Incorrect email or password.";
    }
    if (normalized.includes("email not confirmed")) {
      return "Please verify your email first, then login.";
    }
    if (normalized.includes("too many requests")) {
      return "Too many attempts. Please wait and try again.";
    }

    return "Unable to login right now. Please try again.";
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error || !data.user) {
      setMessage(mapLoginError(error?.message));
      setIsSubmitting(false);
      return;
    }

    if (isAdminEmail(data.user.email)) {
      setIsSubmitting(false);
      router.push("/admin");
      return;
    }

    const fullName =
      (data.user.user_metadata?.full_name as string | undefined) ?? "Customer";
    const phone =
      (data.user.user_metadata?.phone as string | undefined) ?? "";

    const customerSync = await createOrUpdateCustomerProfile({
      authUserId: data.user.id,
      fullName,
      email: data.user.email ?? email,
      phone,
    }).catch(() => null);

    if (customerSync && !customerSync.ok) {
      console.warn("customers table missing. Run supabase/fix-customers.sql.");
    }

    setIsSubmitting(false);
    router.push("/profile");
  }

  return (
    <section className="page-shell">
      <div className="mx-auto flex min-h-[70vh] max-w-md items-center px-4 py-12">
        <form
          onSubmit={handleSubmit}
          className="w-full rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"
        >
          <p className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
            Welcome back
          </p>
          <h1 className="mt-2 text-3xl font-bold text-zinc-950">Login</h1>
          <div className="mt-6 space-y-4">
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
              Password
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
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
            {isSubmitting ? "Logging in..." : "Login"}
          </button>
          <p className="mt-4 text-sm text-zinc-600">
            New customer?{" "}
            <Link href="/register" className="font-semibold text-pink-600">
              Create account
            </Link>
          </p>
        </form>
      </div>
    </section>
  );
}
