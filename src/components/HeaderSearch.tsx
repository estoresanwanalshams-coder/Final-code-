"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type SearchSuggestion = {
  slug: string;
  name: string;
  imageUrl: string;
};

type HeaderSearchProps = {
  onNavigate?: () => void;
};

export function HeaderSearch({ onNavigate }: HeaderSearchProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node | null;
      if (!target || !containerRef.current) {
        return;
      }
      if (!containerRef.current.contains(target)) {
        setSuggestions([]);
      }
    }

    window.addEventListener("mousedown", handlePointerDown);
    return () => window.removeEventListener("mousedown", handlePointerDown);
  }, []);

  useEffect(() => {
    const normalizedQuery = query.trim();
    if (normalizedQuery.length < 1) {
      return;
    }

    const timer = window.setTimeout(async () => {
      const response = await fetch(
        `/api/products/suggest?q=${encodeURIComponent(normalizedQuery)}`,
      ).catch(() => null);

      if (!response?.ok) {
        setSuggestions([]);
        return;
      }

      const payload = (await response.json()) as { products?: SearchSuggestion[] };
      setSuggestions(payload.products ?? []);
    }, 200);

    return () => window.clearTimeout(timer);
  }, [query]);

  const visibleSuggestions = query.trim().length < 1 ? [] : suggestions;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedQuery = query.trim();
    setSuggestions([]);

    if (!trimmedQuery) {
      router.push("/categories");
      onNavigate?.();
      return;
    }

    router.push(`/search?q=${encodeURIComponent(trimmedQuery)}`);
    onNavigate?.();
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <form onSubmit={handleSubmit} className="header-search w-full" role="search">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search products"
          aria-label="Search products"
        />
        <button type="submit" aria-label="Search">
          <svg
            aria-hidden="true"
            className="h-4 w-4"
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
        </button>
      </form>
      {visibleSuggestions.length > 0 ? (
        <div className="search-suggestions">
          {visibleSuggestions.map((product) => (
            <Link
              key={product.slug}
              href={`/products/${product.slug}`}
              onClick={() => {
                setSuggestions([]);
                setQuery("");
                onNavigate?.();
              }}
              className="flex items-center gap-3 px-3 py-2 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-50"
            >
              <span className="relative h-10 w-10 overflow-hidden rounded-md bg-zinc-100">
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  sizes="40px"
                  loading="lazy"
                  className="object-cover"
                />
              </span>
              {product.name}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}