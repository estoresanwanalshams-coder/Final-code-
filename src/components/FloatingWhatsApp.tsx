"use client";

import { usePathname } from "next/navigation";

const whatsappNumber = "971562300750";

export function FloatingWhatsApp() {
  const pathname = usePathname();
const hideOnCategoryPages =
  pathname === "/categories" ||
  pathname.startsWith("/categories/");

if (hideOnCategoryPages) {
  return null;
}
  const hideOnMobile =
    pathname === "/cart" ||
    pathname.startsWith("/inquiry/") ||
    pathname === "/track-order"

  return (
    <a
      href={`https://wa.me/${whatsappNumber}`}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat on WhatsApp"
      className={`floating-whatsapp ${
        hideOnMobile ? "floating-whatsapp-hide-mobile" : ""
      }`}
    >
      <svg viewBox="0 0 32 32" aria-hidden="true" className="h-6 w-6">
        <path
          fill="currentColor"
          d="M16 3C9.373 3 4 8.373 4 15c0 2.111.548 4.094 1.508 5.817L4 29l8.423-1.474A11.93 11.93 0 0 0 16 28c6.627 0 12-5.373 12-12S22.627 3 16 3Zm0 22c-1.767 0-3.42-.47-4.85-1.29l-.347-.198-4.998.875.89-4.87-.226-.355A9.946 9.946 0 0 1 6 15c0-5.514 4.486-10 10-10s10 4.486 10 10-4.486 10-10 10Zm5.489-7.496c-.3-.15-1.776-.876-2.052-.976-.275-.1-.476-.15-.676.15-.2.3-.776.976-.951 1.176-.175.2-.35.225-.65.075-.3-.15-1.266-.467-2.41-1.488-.891-.794-1.493-1.775-1.668-2.075-.175-.3-.019-.462.131-.611.135-.134.3-.35.45-.525.15-.175.2-.3.3-.5.1-.2.05-.375-.025-.525-.075-.15-.676-1.626-.926-2.226-.244-.585-.492-.506-.676-.515h-.575c-.2 0-.525.075-.8.375s-1.051 1.026-1.051 2.501 1.076 2.901 1.226 3.101c.15.2 2.117 3.232 5.126 4.532.716.309 1.275.493 1.711.631.719.228 1.373.196 1.89.119.577-.086 1.776-.726 2.027-1.426.25-.7.25-1.3.175-1.426-.075-.125-.275-.2-.575-.35Z"
        />
      </svg>
    </a>
  );
}
