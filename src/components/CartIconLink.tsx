"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getCartItems } from "@/lib/cart";

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

export function CartIconLink() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    function updateCount() {
      setCount(
        getCartItems().reduce((total, item) => total + item.quantity, 0),
      );
    }

    updateCount();
    window.addEventListener("cart:updated", updateCount);
    window.addEventListener("storage", updateCount);

    return () => {
      window.removeEventListener("cart:updated", updateCount);
      window.removeEventListener("storage", updateCount);
    };
  }, []);

  return (
    <Link href="/cart" prefetch={false} className="icon-action relative" aria-label="Open cart">
      <CartIcon />
      {count > 0 ? <span className="cart-badge">{count}</span> : null}
    </Link>
  );
}
