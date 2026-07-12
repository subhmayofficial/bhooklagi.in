"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Image as ImageIcon,
  LayoutGrid,
  Settings,
  ShoppingBag,
  Tag,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ADMIN_LINKS = [
  { href: "/admin/orders", label: "Orders", Icon: ShoppingBag },
  { href: "/admin/menu", label: "Menu", Icon: LayoutGrid },
  { href: "/admin", label: "Users", Icon: Users, exact: true },
  { href: "/admin/coupons", label: "Offers", Icon: Tag },
  { href: "/admin/banners", label: "Banners", Icon: ImageIcon },
  { href: "/admin/subscribers", label: "Alerts", Icon: Bell },
  { href: "/admin/settings", label: "Settings", Icon: Settings },
];

export function AdminQuickNav() {
  const pathname = usePathname();
  if (pathname === "/admin/login") return null;

  return (
    <nav
      aria-label="Admin quick navigation"
      className="fixed inset-x-0 bottom-0 z-[950] border-t border-gray-200/80 bg-white/95 px-2 pb-[max(0.65rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-12px_34px_rgba(15,23,42,0.12)] backdrop-blur-xl dark:border-white/10 dark:bg-gray-950/95 md:left-1/2 md:right-auto md:bottom-4 md:w-[min(760px,calc(100%-2rem))] md:-translate-x-1/2 md:rounded-3xl md:border md:px-3 md:pb-3"
    >
      <div className="hide-scrollbar flex gap-1 overflow-x-auto md:grid md:grid-cols-7 md:overflow-visible">
        {ADMIN_LINKS.map(({ href, label, Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex min-w-[76px] flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-[10px] font-extrabold transition-all md:min-w-0",
                active
                  ? "bg-brand-orange text-white shadow-md shadow-brand-orange/25"
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-white",
              )}
            >
              <Icon className="h-4 w-4" strokeWidth={2.5} />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
