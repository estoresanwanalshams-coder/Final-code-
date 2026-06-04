"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { CartIconLink } from "@/components/CartIconLink";
import { DynamicCategoryLinks } from "@/components/DynamicCategoryLinks";
import { HeaderSearch } from "@/components/HeaderSearch";

function CartIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 3h2l2.1 11.2a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 2-1.6L20 7H6"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10 20a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm9 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"
      />
    </svg>
  );
}

export function Header() {
  const mobileMenuRef = useRef<HTMLDetailsElement | null>(null);

  function closeMobileMenu() {
    if (mobileMenuRef.current) {
      mobileMenuRef.current.open = false;
    }
  }

  return (
    <header className="site-header sticky top-0 z-50 border-b border-zinc-200 !bg-white backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="brand-text shrink-0"
          aria-label="HM shop online home"
        >
          <Image
            src="/hm-logo.svg"
            alt="HM shop online logo"
            width={146}
            height={72}
            priority
            className="h-14 w-auto sm:h-16"
          />
        </Link>

        <div className="header-search-wrap min-w-0 flex-1">
          <HeaderSearch />
        </div>
        <div className="header-actions flex items-center gap-3">
          <Link href="/profile" className="icon-action relative" aria-label="Open profile">
            <svg
              aria-hidden="true"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M18 20a6 6 0 0 0-12 0"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"
              />
            </svg>
          </Link>
          <CartIconLink />
        </div>
      </div>

      <div className="border-t border-zinc-100">
        <div className="mx-auto hidden max-w-7xl items-center gap-7 px-4 py-3 sm:px-6 lg:flex lg:px-8">
          <Link href="/" className="nav-link">
            Home
          </Link>
          <div className="group relative py-2">
            <Link href="/categories" className="nav-link flex items-center">
              Categories
            </Link>
            <div className="dropdown-panel invisible absolute left-0 top-full w-64 border border-zinc-200 bg-white p-3 opacity-0 shadow-xl transition group-hover:visible group-hover:opacity-100">
              <div className="flex flex-col">
                <DynamicCategoryLinks />
              </div>
            </div>
          </div>
          <Link href="/about" className="nav-link">
            About Us
          </Link>
          <Link href="/contact" className="nav-link">
            Contact Us
          </Link>
        </div>
      </div>

      <div className="border-t border-zinc-100 px-4 py-2 lg:hidden">
        <details ref={mobileMenuRef} className="relative">
          <summary className="cursor-pointer list-none rounded-md border border-zinc-300 px-3 py-2 text-sm font-semibold text-zinc-900">
            Menu
          </summary>
          <div className="absolute right-0 mt-3 w-64 border border-zinc-200 bg-white p-4 shadow-xl">
            <nav aria-label="Mobile navigation" className="flex flex-col gap-4">
              <Link href="/" className="nav-link" onClick={closeMobileMenu}>
                Home
              </Link>
              <div className="flex flex-col gap-2">
                <span className="text-sm font-bold text-zinc-950">Categories</span>
                <DynamicCategoryLinks mobile onNavigate={closeMobileMenu} />
              </div>
              <HeaderSearch onNavigate={closeMobileMenu} />
              <Link href="/about" className="nav-link" onClick={closeMobileMenu}>
                About Us
              </Link>
              <Link href="/contact" className="nav-link" onClick={closeMobileMenu}>
                Contact Us
              </Link>
              <Link href="/login" className="nav-link" onClick={closeMobileMenu}>
                Login / Register
              </Link>
              <Link
                href="/cart"
                onClick={closeMobileMenu}
                className="primary-action inline-flex items-center justify-center gap-2 text-center"
              >
                <CartIcon />
                Cart
              </Link>
            </nav>
          </div>
        </details>
      </div>
    </header>
  );
}
