import Link from "next/link";
import { Instagram, Mail } from "lucide-react";

const navLinks = [
  { href: "/menu",   label: "Menu" },
  { href: "/offers", label: "Offers" },
  { href: "/contact", label: "Contact" },
];

const legalLinks = [
  { href: "/privacy-policy",  label: "Privacy Policy" },
  { href: "/terms",           label: "Terms & Conditions" },
  { href: "/refund-policy",   label: "Refund & Cancellation" },
  { href: "/delivery-policy", label: "Delivery Policy" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-gray-200 bg-white px-4 pt-10 pb-6 md:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-8 md:grid-cols-3">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-orange text-base">
                🍔
              </span>
              <span className="font-display text-lg tracking-[0.06em] text-ink">
                BHOOK LAGI?
              </span>
            </div>
            <p className="mt-2 text-[13px] leading-relaxed text-gray-500">
              Deoghar&apos;s craving kitchen — burgers, rolls, maggi & more. Cloud kitchen only.
            </p>
            <div className="mt-3 flex items-center gap-3">
              <a
                href="https://www.instagram.com/bhooklagi.in"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition-colors hover:border-pink-300 hover:text-pink-600"
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="mailto:orders@bhooklagi.in"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition-colors hover:border-brand-orange/40 hover:text-brand-orange"
                aria-label="Email"
              >
                <Mail className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-gray-400">
              Quick links
            </p>
            <ul className="space-y-2">
              {navLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-[13px] font-medium text-gray-600 transition-colors hover:text-brand-orange"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-gray-400">
              Policies
            </p>
            <ul className="space-y-2">
              {legalLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-[13px] font-medium text-gray-600 transition-colors hover:text-brand-orange"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-gray-100 pt-6 md:flex-row">
          <p className="text-[12px] text-gray-400">
            © {new Date().getFullYear()} Bhook Lagi? · Deoghar, Jharkhand · All rights reserved
          </p>
          <p className="text-[12px] text-gray-400">orders@bhooklagi.in</p>
        </div>
      </div>
    </footer>
  );
}
