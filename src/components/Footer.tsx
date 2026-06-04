import Link from "next/link";
import Image from "next/image";

const footerLinks = [
  { label: "Home", href: "/"},
  { label: "Categories", href: "/categories" },
  { label: "Track Order", href: "/track-order" },
  { label: "About Us", href: "/about" },
  { label: "Contact Us", href: "/contact" },
];

const policyLinks = [
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms & Conditions", href: "/terms-and-conditions" },
  { label: "Return Policy", href: "/return-policy" },
  { label: "FAQ", href: "/faq" },
  { label: "Shipping Policy", href: "/shipping-policy" },
];

const contactNumber = "+971 55 931 9338";
const socialLinks = [
  {
    label: "Instagram",
    href: "https://instagram.com",
    icon: (
      <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2ZM12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm0 1.5a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7Zm5.25-.88a1.13 1.13 0 1 0 0 2.26 1.13 1.13 0 0 0 0-2.26Z" />
      </svg>
    ),
  },
  {
    label: "Facebook",
    href: "https://facebook.com",
    icon: (
      <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M13.5 8.5V6.8c0-.74.16-1.3 1.24-1.3H16V3.05c-.22-.03-.99-.1-1.88-.1-2.79 0-4.12 1.47-4.12 4.22V8.5H7.5V11h2.5v10h3.5V11h2.3l.34-2.5h-2.64Z" />
      </svg>
    ),
  },
  {
    label: "Twitter/X",
    href: "https://x.com",
    icon: (
      <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M18.9 2H21l-4.6 5.24L22 22h-4.42l-3.46-4.52L10.1 22H8l4.93-5.62L2 2h4.53l3.13 4.13L12.9 2h2.1l-4.3 4.9L18.9 2Zm-1.55 18h1.23L6.06 3.9H4.74L17.35 20Z" />
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    href: "https://linkedin.com",
    icon: (
      <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M6.75 8.6H3.5V20h3.25V8.6Zm.23-3.53a1.88 1.88 0 1 0-3.75 0 1.88 1.88 0 0 0 3.75 0ZM20.5 13.46c0-3.42-1.83-5-4.28-5-1.97 0-2.86 1.08-3.35 1.84V8.6H9.62V20h3.25v-5.63c0-1.48.28-2.91 2.1-2.91 1.8 0 1.82 1.68 1.82 3V20h3.25v-6.54Z" />
      </svg>
    ),
  },
];

export function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-zinc-950 text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-5 lg:px-8">
        
        {/* Brand */}
        <div>
          <Link
            href="/"
            className="brand-text inline-flex items-center"
          >
            <Image
              src="/hm-logo.svg"
              alt="HM shop online logo"
              width={120}
              height={58}
              className="h-10 w-auto"
            />
          </Link>

          <p className="mt-4 max-w-md text-sm leading-6 text-zinc-300">
            A clean ecommerce experience for curated products,
            seasonal offers, and simple shopping from product
            discovery to checkout.
          </p>
        </div>

        {/* Main Links */}
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
            Explore
          </h2>

          <nav className="mt-4 flex flex-col gap-3">
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="w-fit text-sm text-zinc-300 transition hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Policy Links */}
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
            Policies
          </h2>

          <nav className="mt-4 flex flex-col gap-3">
            {policyLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="w-fit text-sm text-zinc-300 transition hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Contact */}
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
            Contact
          </h2>

          <div className="mt-4 space-y-3 text-sm text-zinc-300">
            <p>support@storefront.com</p>

            <a
              href="tel:+971559319338"
              className="w-fit block transition hover:text-white"
            >
              {contactNumber}
            </a>

            <p>Mon to Sat, 10:00 AM - 7:00 PM</p>
            <p>United Arab Emirates</p>
          </div>
        </div>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
            Follow us
          </h2>
          <nav className="mt-4 flex flex-col gap-3">
            {socialLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-fit items-center gap-2 text-sm text-zinc-300 transition hover:text-white"
              >
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-zinc-600">
                  {link.icon}
                </span>
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-white/10 px-4 py-5 text-center text-sm text-zinc-400">
        <p>&copy; 2026 Storefront. All rights reserved.</p>

        <p className="mt-2">
          Designed and developed by{" "}
          <a
            href="https://hussainiitservices.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-white transition hover:text-zinc-200"
          >
            hussainiitservices.com
          </a>
        </p>
      </div>
    </footer>
  );
}