"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, UtensilsCrossed, Receipt, User, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useCartStore, cartTotals } from "@/stores/cart-store";
import { useEffect, useState } from "react";

const links = [
  { href: "/home",   label: "Home",    Icon: Home },
  { href: "/menu",   label: "Menu",    Icon: UtensilsCrossed },
  { href: "/orders", label: "Orders",  Icon: Receipt },
  { href: "/account",label: "Account", Icon: User },
  { href: "/cart",   label: "Cart",    Icon: ShoppingBag },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  const lines    = useCartStore((s) => s.lines);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const { qty } = cartTotals(lines);

  const HIDDEN_PATHS = ["/", "/cart", "/checkout"];
  if (HIDDEN_PATHS.includes(pathname) || pathname.startsWith("/orders/")) return null;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-[900] md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="border-t border-gray-200 bg-white px-2 pb-2 pt-1 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-1">
          {links.map(({ href, label, Icon }) => {
            const active = href === "/home" ? pathname === "/home" || pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "relative flex flex-1 flex-col items-center justify-center gap-0.5 rounded-xl py-2 text-[10px] font-bold uppercase tracking-[0.12em] transition-colors",
                  active ? "text-brand-orange" : "text-gray-400 hover:text-gray-600",
                )}
              >
                {active && (
                  <motion.span
                    layoutId="bottom-tab"
                    className="absolute inset-0 rounded-xl bg-brand-orange/[0.08]"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
                <span className="relative">
                  <Icon className="mx-auto h-5 w-5" strokeWidth={active ? 2.5 : 1.8} />
                  {href === "/cart" && mounted && qty > 0 && (
                    <span className="absolute -right-2 -top-2 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-brand-orange px-1 text-[10px] font-bold text-white shadow">
                      {qty > 9 ? "9+" : qty}
                    </span>
                  )}
                </span>
                <span className="relative">{label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
