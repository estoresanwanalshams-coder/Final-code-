"use client";

import { useEffect, useState } from "react";

export function FloatingActions() {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    function onScroll() {
      setShowScrollTop(window.scrollY > 320);
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="floating-actions">
      {showScrollTop ? (
        <button
          type="button"
          onClick={scrollToTop}
          className="floating-action-btn floating-action-top"
          aria-label="Scroll to top"
        >
          ↑
        </button>
      ) : null}
    </div>
  );
}
