"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { useState } from "react";
import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/home",   label: "Home" },
  { href: "/menu",   label: "Menu" },
  { href: "/offers", label: "Offers" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 48));

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
          <Link href="/home" className="flex items-center gap-2.5">
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

        <div className="h-8 w-8" />
      </div>
    </motion.header>
  );
}
