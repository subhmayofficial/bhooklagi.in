"use client";

import { usePathname } from "next/navigation";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { getWhatsAppLink } from "@/lib/whatsapp";

export function WhatsAppFloatButton() {
  const pathname = usePathname();
  // Only show on the coming-soon landing page — other pages have inline WhatsApp links
  if (pathname !== "/") return null;

  return (
    <a
      href={getWhatsAppLink()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Order on WhatsApp"
      className="fixed bottom-6 right-4 z-[950] flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_8px_24px_rgba(37,211,102,0.45)] transition-transform hover:scale-105 active:scale-95"
    >
      <WhatsAppIcon className="h-7 w-7" />
    </a>
  );
}
