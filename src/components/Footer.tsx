import Link from "next/link";
import Image from "next/image";

const footerLinks = [
  { label: "Home", href: "/" },
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

const contactNumber = "+971 56 230 0750";
const socialLinks = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/hmshoponlineuae/",
    icon: (
      <svg
        aria-hidden="true"
        className="h-4 w-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2ZM12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm0 1.5a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7Zm5.25-.88a1.13 1.13 0 1 0 0 2.26 1.13 1.13 0 0 0 0-2.26Z" />
      </svg>
    ),
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/hmshoponlineuae",
    icon: (
      <svg
        aria-hidden="true"
        className="h-4 w-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path d="M13.5 8.5V6.8c0-.74.16-1.3 1.24-1.3H16V3.05c-.22-.03-.99-.1-1.88-.1-2.79 0-4.12 1.47-4.12 4.22V8.5H7.5V11h2.5v10h3.5V11h2.3l.34-2.5h-2.64Z" />
      </svg>
    ),
  },
];

export function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-zinc-950 text-white">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-10 sm:grid-cols-2 sm:gap-10 sm:px-6 sm:py-12 lg:grid-cols-5 lg:px-8">
        {/* Brand */}
        <div>
          <Link href="/" className="brand-text inline-flex items-center">
            <Image
              src="/hm-shoponline-logo-footer1.png"
              alt="HM Shop Online"
              width={150}
              height={103}
              className="max-w-full object-contain"
            />
          </Link>

          <p className="mt-4 max-w-md text-sm leading-6 text-zinc-300">
            HM Shop Online is your UAE destination for trending products, useful
            everyday essentials, gadgets, home & kitchen finds, beauty products,
            toys, and more — bringing great value and convenient shopping
            straight to your door.
          </p>
        </div>

        {/* Main Links */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-400">
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
          <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-400">
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
          <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-400">
            Contact
          </h2>

          <div className="mt-4 space-y-3 text-sm text-zinc-300">
            <p>info@hmshoponline.com</p>

            <a
              href="tel:+971562300750"
              className="w-fit block transition hover:text-white"
            >
              {contactNumber}
            </a>

            <p>Mon to Sat, 10:00 AM - 7:00 PM</p>
            <p>United Arab Emirates</p>
          </div>
        </div>

        <div>
          <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-400">
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
        <p>&copy; 2026 HM Shop Online. All rights reserved.</p>

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
