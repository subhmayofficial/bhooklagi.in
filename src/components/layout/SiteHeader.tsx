"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { useState } from "react";
import { MapPin, ShoppingBag, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCartStore, cartTotals } from "@/stores/cart-store";

const navLinks = [
  { href: "/",       label: "Home" },
  { href: "/menu",   label: "Menu" },
  { href: "/offers", label: "Offers" },
  { href: "/orders", label: "Track Order" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 48));

  const lines = useCartStore((s) => s.lines);
  const { qty } = cartTotals(lines);

  return (
    <motion.header
      className={cn(
        "fixed left-0 right-0 top-0 z-[800] transition-all duration-200 fixed-gpu",
        scrolled ? "glass-nav h-[56px] shadow-sm" : "h-[60px] bg-white border-b border-gray-100",
      )}
    >
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-orange text-white shadow-sm">
              <span className="font-display text-[18px] leading-none tracking-wide">BL</span>
            </span>
            <span className="font-display text-[1.05rem] tracking-[0.06em] text-ink">
              BHOOK LAGI?
            </span>
          </Link>

          <div className="ml-1 hidden items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 md:flex">
            <MapPin className="h-3 w-3 text-brand-orange" strokeWidth={2.5} />
            <span className="text-[11px] font-semibold text-gray-600">Deoghar, JH</span>
          </div>
        </div>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map(({ href, label }) => {
            const active = (href === "/" || href === "/home") ? (pathname === "/" || pathname === "/home") : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "text-[13px] font-semibold transition-colors",
                  active
                    ? "text-brand-orange"
                    : "text-gray-600 hover:text-gray-900",
                )}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Mobile + Desktop Actions */}
        <div className="flex items-center gap-2">
          <Link
            href="/cart"
            className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900 active:scale-90 transition-all"
          >
            <ShoppingBag className="h-5 w-5" strokeWidth={1.8} />
            {qty > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-orange text-[9px] font-extrabold text-white">
                {qty > 9 ? "9+" : qty}
              </span>
            )}
          </Link>
          <Link
            href="/account"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900 active:scale-90 transition-all"
          >
            <User className="h-5 w-5" strokeWidth={1.8} />
          </Link>
        </div>
      </div>
    </motion.header>
  );
}
