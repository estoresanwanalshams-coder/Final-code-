"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const adminUsername = "Murtaza sanwala";
const adminEmail =
  process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? "murtaza.sanwala@admin.local";

type AdminAuthGateProps = {
  children: React.ReactNode;
};

export function AdminAuthGate({ children }: AdminAuthGateProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setIsAuthenticated(user?.email === adminEmail);
      setIsLoading(false);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (username !== adminUsername) {
      setError("Invalid username or password.");
      return;
    }

    const { data, error: loginError } = await supabase.auth.signInWithPassword({
      email: adminEmail,
      password,
    });

    if (!loginError && data.user?.email === adminEmail) {
      setIsAuthenticated(true);
      setError("");
      return;
    }

    setError("Invalid username or password.");
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setUsername("");
    setPassword("");
  }

  if (isLoading) {
    return (
      <section className="page-shell">
        <div className="mx-auto flex min-h-[60vh] items-center justify-center px-4 py-12">
          <p className="text-sm font-bold uppercase tracking-wider text-zinc-500">
            Checking admin session...
          </p>
        </div>
      </section>
    );
  }

  if (isAuthenticated) {
    return (
      <>
        <header className="border-b border-zinc-800 bg-zinc-950 text-white">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-500 text-lg font-extrabold text-white">
                HM
              </div>

              <div className="min-w-0">
                <p className="truncate text-base font-bold">HM Shop Online</p>

                <p className="text-xs font-medium uppercase tracking-[0.16em] text-zinc-400">
                  Admin Panel
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden text-right lg:block">
                <p className="text-xs text-zinc-400">Logged in as</p>
                <p className="text-sm font-semibold text-white">
                  {adminUsername}
                </p>
              </div>

              <Link
                href="/"
                target="_blank"
                rel="noreferrer"
                className="rounded-lg border border-zinc-700 px-3 py-2 text-xs font-bold text-zinc-200 transition hover:border-orange-500 hover:text-orange-400 sm:px-4 sm:text-sm"
              >
                View Storefront
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg bg-orange-500 px-3 py-2 text-xs font-bold text-white transition hover:bg-orange-600 sm:px-4 sm:text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        {children}
      </>
    );
  }

  return (
    <section className="page-shell">
      <div className="mx-auto flex min-h-[70vh] max-w-xl items-center px-4 py-12 sm:px-6 lg:px-8">
        <form
          onSubmit={handleLogin}
          className="content-reveal w-full rounded-3xl bg-zinc-950 p-6 text-white shadow-2xl sm:p-8"
        >
          <p className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
            Admin login
          </p>
          <h1 className="mt-3 text-3xl font-bold">Access admin panel</h1>
          <div className="mt-7 grid gap-5">
            <label className="form-field">
              Username
              <input
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="Enter username"
                required
              />
            </label>
            <label className="form-field">
              Password
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter password"
                required
              />
            </label>
          </div>
          {error ? (
            <p className="mt-4 text-sm font-bold text-red-300">{error}</p>
          ) : null}
          <button className="animated-button inquiry-submit mt-6 w-full">
            Login
          </button>
        </form>
      </div>
    </section>
  );
}
