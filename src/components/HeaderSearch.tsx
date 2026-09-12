"use client";

import { SafeProductImage } from "@/components/SafeProductImage";
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
  const [isSearching, setIsSearching] = useState(false);

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
      setSuggestions([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    const timer = window.setTimeout(async () => {
      const response = await fetch(
        `/api/products/suggest?q=${encodeURIComponent(normalizedQuery)}`,
      ).catch(() => null);

      if (!response?.ok) {
        setSuggestions([]);
        setIsSearching(false);
        return;
      }

      const payload = (await response.json()) as {
        products?: SearchSuggestion[];
      };

      setSuggestions(payload.products ?? []);
      setIsSearching(false);
    }, 200);

    return () => window.clearTimeout(timer);
  }, [query]);

  const normalizedQuery = query.trim();
  const visibleSuggestions = normalizedQuery.length < 1 ? [] : suggestions;

  function clearSearch() {
    setSuggestions([]);
    setQuery("");
    setIsSearching(false);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedQuery = query.trim();

    clearSearch();

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
      <form
        onSubmit={handleSubmit}
        className="header-search w-full"
        role="search"
      >
        <span className="header-search-leading-icon" aria-hidden="true">
          <svg
            className="h-[18px] w-[18px]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="1.9"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m21 21-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
            />
          </svg>
        </span>

        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search products"
          aria-label="Search products"
          autoComplete="off"
        />

        {query.length > 0 ? (
          <button
            type="button"
            className="header-search-clear"
            onClick={clearSearch}
            aria-label="Clear search"
          >
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
                d="M6 6l12 12M18 6 6 18"
              />
            </svg>
          </button>
        ) : null}
      </form>

      {normalizedQuery.length > 0 &&
      (isSearching || visibleSuggestions.length > 0) ? (
        <div className="search-suggestions">
          <div className="search-suggestions-heading">
            <span>Product suggestions</span>

            {isSearching ? (
              <span className="search-suggestions-status">Searching...</span>
            ) : null}
          </div>

          {visibleSuggestions.map((product) => (
            <Link
              key={product.slug}
              href={`/products/${product.slug}`}
              onClick={() => {
                clearSearch();
                onNavigate?.();
              }}
              className="search-suggestion-item"
            >
              <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-zinc-100 bg-zinc-50">
                <SafeProductImage
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  sizes="48px"
                  loading="lazy"
                  className="object-contain p-1"
                />
              </span>

              <span className="min-w-0 flex-1">
                <span className="line-clamp-2 block text-sm font-semibold leading-5 text-zinc-900">
                  {product.name}
                </span>

                <span className="mt-0.5 block text-xs font-medium text-zinc-500">
                  View product
                </span>
              </span>

              <svg
                aria-hidden="true"
                className="h-4 w-4 shrink-0 text-zinc-400 transition group-hover:text-orange-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m9 18 6-6-6-6"
                />
              </svg>
            </Link>
          ))}

          {!isSearching ? (
            <button
              type="button"
              className="search-view-all"
              onClick={() => {
                const searchQuery = query.trim();

                clearSearch();
                router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
                onNavigate?.();
              }}
            >
              <span>
                View all results for{" "}
                <strong>&ldquo;{normalizedQuery}&rdquo;</strong>
              </span>

              <span aria-hidden="true">→</span>
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
