"use client";

import { motion } from "framer-motion";
import { Phone, MapPin } from "lucide-react";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { getWhatsAppLink, WHATSAPP_DISPLAY } from "@/lib/whatsapp";

export function ComingSoonLanding() {
  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-white px-6 text-center">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-brand-orange/[0.06] via-transparent to-transparent"
      />

      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative mb-6 inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-4 py-1.5"
      >
        <span className="text-[13px] font-bold text-amber-700">🚧 Website coming soon</span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-brand-orange text-4xl shadow-lg"
      >
        🍔
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.18 }}
        className="relative mt-6 font-display text-[clamp(3rem,12vw,5.5rem)] leading-[0.9] tracking-[0.01em] text-ink"
      >
        BHOOK <span className="text-gradient-brand">LAGI?</span>
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.24 }}
        className="relative mt-2 font-display text-[clamp(1rem,3vw,1.5rem)] tracking-[0.18em] text-gray-400"
      >
        HUM HAI NA!
      </motion.p>

      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="relative mt-5 max-w-sm text-[15px] leading-relaxed text-gray-500"
      >
        We&apos;re cooking something tasty. For now, order directly on WhatsApp — burgers, rolls, maggi, Chinese &amp; more.
      </motion.p>

      <motion.a
        href={getWhatsAppLink()}
        target="_blank"
        rel="noopener noreferrer"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.38 }}
        className="relative mt-8 inline-flex items-center gap-2 rounded-2xl bg-[#25D366] px-8 py-4 text-[16px] font-bold text-white shadow-[0_8px_28px_rgba(37,211,102,0.4)] transition-all hover:bg-[#1DA851] active:scale-[0.98]"
      >
        <WhatsAppIcon className="h-5 w-5" />
        Order now on WhatsApp
      </motion.a>

      <motion.a
        href="tel:+919296834048"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.46 }}
        className="relative mt-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-gray-500 transition-colors hover:text-brand-orange"
      >
        <Phone className="h-3.5 w-3.5" strokeWidth={2.5} />
        Or call us on {WHATSAPP_DISPLAY}
      </motion.a>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.52 }}
        className="relative mt-8 inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3.5 py-1.5 text-[12px] font-semibold text-gray-500"
      >
        <MapPin className="h-3.5 w-3.5 text-brand-orange" strokeWidth={2.5} />
        Deoghar, Jharkhand
      </motion.div>
    </main>
  );
}
