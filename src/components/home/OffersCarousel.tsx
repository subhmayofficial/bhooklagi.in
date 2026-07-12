"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tag, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/stores/cart-store";

type Banner = {
  id: string;
  title: string;
  subtitle: string | null;
  coupon_code: string | null;
  theme_color: string;
};

const THEMES: Record<string, string> = {
  orange: "from-orange-500 to-rose-500",
  blue: "from-blue-500 to-cyan-500",
  purple: "from-purple-500 to-indigo-500",
  green: "from-emerald-500 to-teal-500",
  dark: "from-gray-800 to-gray-900",
};

export function OffersCarousel() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/banners")
      .then((res) => res.json())
      .then((data) => {
        if (data.banners) setBanners(data.banners);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading || banners.length === 0) return null;

  return (
    <div className="w-full overflow-hidden py-4">
      <div className="mb-3 px-4 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-brand-orange" />
        <h2 className="text-[16px] font-black tracking-tight text-gray-900">Featured Offers</h2>
      </div>
      <div className="flex w-full gap-4 overflow-x-auto px-4 pb-6 pt-2 hide-scrollbar snap-x snap-mandatory">
        {banners.map((banner, index) => {
          const themeClasses = THEMES[banner.theme_color] || THEMES.orange;
          
          return (
            <motion.div
              key={banner.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => {
                if (banner.coupon_code) {
                  // If we wanted to auto apply, we could add it to cart store here or pass via url
                  // For now, we will just copy it to clipboard and toast, or alert.
                  navigator.clipboard.writeText(banner.coupon_code);
                  alert(`Copied code ${banner.coupon_code} to clipboard!`);
                  router.push("/cart");
                }
              }}
              className="group relative flex w-[280px] shrink-0 snap-center flex-col justify-between overflow-hidden rounded-3xl p-5 shadow-lg shadow-gray-200/50 cursor-pointer active:scale-[0.98] transition-transform bg-white border border-gray-100"
            >
              <div className={`absolute -right-12 -top-12 h-32 w-32 rounded-full opacity-20 blur-2xl bg-gradient-to-br ${themeClasses}`} />
              
              <div className="relative z-10">
                <span className={`inline-block h-2.5 w-8 rounded-full bg-gradient-to-r ${themeClasses} mb-3 shadow-sm`} />
                <h3 className="text-[20px] font-black leading-tight text-gray-900">{banner.title}</h3>
                {banner.subtitle && <p className="mt-1 text-[13px] font-medium leading-snug text-gray-500">{banner.subtitle}</p>}
              </div>

              {banner.coupon_code && (
                <div className="relative z-10 mt-5 flex items-center justify-between">
                  <div className={`flex items-center gap-1.5 rounded-xl bg-gradient-to-r ${themeClasses} px-3 py-1.5 shadow-sm`}>
                    <Tag className="h-3.5 w-3.5 text-white/90" />
                    <span className="text-[12px] font-black tracking-widest text-white">{banner.coupon_code}</span>
                  </div>
                  <span className={`text-[10px] font-extrabold uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r ${themeClasses}`}>
                    Tap to apply
                  </span>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
