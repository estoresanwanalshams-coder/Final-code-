"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
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

function SearchIcon() {
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
        d="m21 21-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
      />
    </svg>
  );
}

export function Header() {
  const mobileMenuRef = useRef<HTMLDetailsElement | null>(null);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= 1024) {
        setMobileSearchOpen(false);
      }
    }

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  function closeMobileMenu() {
    if (mobileMenuRef.current) {
      mobileMenuRef.current.open = false;
    }
  }

  function closeMobileSearch() {
    setMobileSearchOpen(false);
  }

  return (
    <header className="site-header sticky top-0 z-50 border-b border-zinc-200/80 bg-white/95 shadow-[0_1px_0_rgba(0,0,0,0.02)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2.5 sm:px-6 lg:gap-5 lg:px-8 lg:py-3">
        <Link
          href="/"
          className="brand-text shrink-0"
          aria-label="HM shop online home"
        >
          <Image
            src="/hm-shoponline-logo-1.png"
            alt="HM Shop Online"
            width={160}
            height={64}
            priority
            className="h-10 w-auto object-contain sm:h-12 lg:h-14"
          />
        </Link>

        <div className="header-search-wrap hidden min-w-0 flex-1 lg:flex">
          <HeaderSearch />
        </div>

        <div className="header-actions ml-auto flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            className="header-search-toggle icon-action"
            aria-label={mobileSearchOpen ? "Close search" : "Open search"}
            aria-expanded={mobileSearchOpen}
            onClick={() => setMobileSearchOpen((open) => !open)}
          >
            <SearchIcon />
          </button>
          <Link
            href="/profile"
            className="icon-action relative"
            aria-label="Open profile"
          >
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

      {mobileSearchOpen ? (
        <div className="header-search-panel-mobile border-t border-zinc-100 px-4 py-3">
          <HeaderSearch
            onNavigate={() => {
              closeMobileSearch();
              closeMobileMenu();
            }}
          />
        </div>
      ) : null}

      <div className="border-t border-zinc-100 bg-white">
        <div className="mx-auto hidden max-w-7xl items-center gap-9 px-4 py-2.5 sm:px-6 lg:flex lg:px-8">
          <Link href="/" className="nav-link">
            Home
          </Link>
          <div className="group relative py-2">
            <Link
              href="/categories"
              className="nav-link flex items-center gap-1.5"
            >
              Categories
              <svg
                aria-hidden="true"
                viewBox="0 0 20 20"
                fill="none"
                className="h-3.5 w-3.5 transition-transform duration-200 group-hover:rotate-180"
              >
                <path
                  d="m6 8 4 4 4-4"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
            <div className="dropdown-panel invisible absolute left-0 top-full z-50 w-72 translate-y-1 rounded-2xl border border-zinc-200 bg-white p-3 opacity-0 shadow-[0_18px_45px_rgba(0,0,0,0.12)] transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
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

      <div className="border-t border-zinc-100 bg-white px-4 py-2 lg:hidden">
        <details ref={mobileMenuRef} className="relative">
          <summary className="inline-flex cursor-pointer list-none items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-50 hover:text-orange-600">
            <span aria-hidden="true" className="text-base">
              ☰
            </span>
            Browse Menu
          </summary>
          <div className="mobile-menu-panel absolute left-0 z-50 mt-2 w-[min(calc(100vw-2rem),20rem)] rounded-xl border border-zinc-200 bg-white p-4 shadow-xl">
            <nav aria-label="Mobile navigation" className="flex flex-col gap-4">
              <Link href="/" className="nav-link" onClick={closeMobileMenu}>
                Home
              </Link>
              <div className="flex flex-col gap-2">
                <span className="text-sm font-bold text-zinc-950">
                  Categories
                </span>
                <DynamicCategoryLinks mobile onNavigate={closeMobileMenu} />
              </div>
              <Link
                href="/about"
                className="nav-link"
                onClick={closeMobileMenu}
              >
                About Us
              </Link>
              <Link
                href="/contact"
                className="nav-link"
                onClick={closeMobileMenu}
              >
                Contact Us
              </Link>
              <Link
                href="/login"
                className="nav-link"
                onClick={closeMobileMenu}
              >
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
