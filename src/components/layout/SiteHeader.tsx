"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { useState, useEffect } from "react";
import { ShoppingBag, MapPin, User } from "lucide-react";
import { useCartStore, cartTotals } from "@/stores/cart-store";
import { useAuthStore } from "@/stores/auth-store";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/menu",   label: "Menu" },
  { href: "/offers", label: "Offers" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 48));

  const lines = useCartStore((s) => s.lines);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const { qty } = cartTotals(lines);

  const user = useAuthStore((s) => s.user);
  const status = useAuthStore((s) => s.status);
  const openLoginModal = useAuthStore((s) => s.openLoginModal);

  return (
    <motion.header
      className={cn(
        "fixed left-0 right-0 top-0 z-[800] transition-all duration-200",
        scrolled ? "glass-nav h-[56px] shadow-sm" : "h-[60px] bg-white border-b border-gray-100",
      )}
    >
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-4 md:px-6">
        {/* Logo + location */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-orange text-base shadow-sm">
              🍔
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
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "text-[13px] font-semibold transition-colors",
                pathname.startsWith(href)
                  ? "text-brand-orange"
                  : "text-gray-600 hover:text-gray-900",
              )}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {/* Auth */}
          {mounted && status === "authenticated" && user ? (
            <Link
              href="/account"
              className="flex items-center gap-1.5 rounded-full border border-gray-200 px-3 py-1.5 text-[12px] font-semibold text-gray-600 hover:text-gray-900"
              title="My account"
            >
              <User className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{user.name || `+91 ${user.phone.slice(-10)}`}</span>
            </Link>
          ) : (
            mounted && status === "guest" && (
              <button
                type="button"
                onClick={openLoginModal}
                className="flex items-center gap-1.5 rounded-full border border-gray-200 px-3 py-1.5 text-[12px] font-semibold text-gray-600 hover:text-gray-900"
              >
                <User className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Log in</span>
              </button>
            )
          )}

          {/* Cart pill */}
          <Link
            href="/cart"
            className="relative flex items-center gap-2 rounded-full bg-brand-orange px-4 py-2 text-[13px] font-bold text-white shadow-md transition-all hover:bg-brand-orange-dark active:scale-[0.97]"
          >
            <ShoppingBag className="h-4 w-4" strokeWidth={2.5} />
            <span className="hidden sm:inline">Bag</span>
            {mounted && qty > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-ink px-1 text-[11px] font-bold text-brand-gold shadow">
                {qty > 9 ? "9+" : qty}
              </span>
            )}
          </Link>
        </div>
      </div>
    </motion.header>
  );
}
