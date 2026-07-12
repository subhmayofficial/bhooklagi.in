"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  MapPin,
  ChevronDown,
  RotateCcw,
  ChevronRight,
  Wallet,
  User,
  Mic,
  X,
  Clock,
  Loader2,
  TrendingUp,
  Plus,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { useCartStore } from "@/stores/cart-store";
import { useSettingsStore } from "@/stores/settings-store";
import type { MenuItem } from "@/data/menu";
import { estimateDeliveryMinutes, type Coords } from "@/lib/location";
import { NotificationCenter } from "@/components/home/NotificationCenter";
import { NotifyMeModal } from "@/components/layout/NotifyMeModal";
import { LocationPickerModal, type StoredDeliveryLocation } from "@/components/home/LocationPickerModal";

type LastOrder = {
  orderNumber: string;
  items: { itemId: string; name: string; qty: number; emoji: string }[];
  createdAt: string;
};

type LastOrderStatus = "idle" | "loading" | "empty" | "ready";

const SEARCH_SUGGESTIONS = ["burgers", "maggi", "rolls", "fries", "cheese maggi", "chicken burger", "paneer roll"];

const QUICK_CATS = [
  { label: "Burgers",    emoji: "🍔", q: "burgers" },
  { label: "Rolls",      emoji: "🌯", q: "rolls" },
  { label: "Maggi",      emoji: "🍜", q: "maggi" },
  { label: "Fries",      emoji: "🍟", q: "fries" },
  { label: "Sandwiches", emoji: "🥪", q: "sandwiches" },
  { label: "Beverages",  emoji: "🧃", q: "beverages" },
];

const TRENDING_SEARCHES = ["cheese maggi", "chicken burger", "egg roll", "peri peri fries", "cold coffee"];

const FLOATERS: { emoji: string; className: string; delay: number; duration: number }[] = [
  { emoji: "🍔", className: "left-[6%] top-[14%] text-2xl", delay: 0,   duration: 3.4 },
  { emoji: "🍟", className: "right-[10%] top-[10%] text-xl", delay: 0.4, duration: 3.0 },
  { emoji: "🌯", className: "right-[18%] bottom-[8%] text-xl", delay: 0.8, duration: 3.8 },
  { emoji: "🧃", className: "left-[16%] bottom-[12%] text-xl", delay: 1.2, duration: 3.2 },
];

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

const DIET_DOT: Record<string, string> = {
  veg:     "bg-green-500",
  "non-veg": "bg-red-500",
  egg:     "bg-amber-500",
};

const LOCATION_LABEL_KEY = "bl_location_label";
const LOCATION_COORDS_KEY = "bl_location_coords";
const DELIVERY_LOCATION_KEY = "bl_delivery_location";

function formatInr(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function AppHomeHero() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const status = useAuthStore((s) => s.status);
  const openLoginModal = useAuthStore((s) => s.openLoginModal);
  const addItem = useCartStore((s) => s.addItem);
  const kitchenSettings = useSettingsStore((s) => s.settings);
  const fetchSettings = useSettingsStore((s) => s.fetchSettings);
  const isClosed = kitchenSettings ? !kitchenSettings.kitchen_open : false;
  const [notifyModalOpen, setNotifyModalOpen] = useState(false);

  const [mounted, setMounted] = useState(false);
  const [query, setQuery] = useState("");
  const [suggestionIndex, setSuggestionIndex] = useState(0);
  const [lastOrder, setLastOrder] = useState<LastOrder | null>(null);
  const [lastOrderStatus, setLastOrderStatus] = useState<LastOrderStatus>("idle");
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  const [locationLabel, setLocationLabel] = useState("Deoghar, Jharkhand");
  const [customerCoords, setCustomerCoords] = useState<Coords | null>(null);
  const [locating, setLocating] = useState(false);
  const [locationErrorMsg, setLocationErrorMsg] = useState<string | null>(null);
  const [locationPickerOpen, setLocationPickerOpen] = useState(false);

  // Search dropdown
  const [searchFocused, setSearchFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isListening, setIsListening] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const menuLoadRef = useRef<Promise<MenuItem[]> | null>(null);

  const loadMenuItems = useCallback(() => {
    if (!menuLoadRef.current) {
      menuLoadRef.current = import("@/data/menu").then((mod) => {
        setMenuItems(mod.menuItems);
        return mod.menuItems;
      });
    }
    return menuLoadRef.current;
  }, []);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  useEffect(() => {
    setMounted(true);
    const cached = localStorage.getItem(LOCATION_LABEL_KEY);
    const cachedLocation = localStorage.getItem(DELIVERY_LOCATION_KEY);
    const cachedCoords = localStorage.getItem(LOCATION_COORDS_KEY);
    if (cached) setLocationLabel(cached);
    let loadedStoredLocation = false;
    if (cachedLocation) {
      try {
        const parsed = JSON.parse(cachedLocation) as StoredDeliveryLocation;
        if (Number.isFinite(parsed.lat) && Number.isFinite(parsed.lng)) {
          setCustomerCoords({ lat: parsed.lat, lng: parsed.lng });
          loadedStoredLocation = true;
        }
      } catch {}
    }
    if (!loadedStoredLocation && cachedCoords) {
      try {
        const parsed = JSON.parse(cachedCoords) as Coords;
        if (Number.isFinite(parsed.lat) && Number.isFinite(parsed.lng)) setCustomerCoords(parsed);
      } catch {}
    }
    try {
      const storedSearches = JSON.parse(localStorage.getItem("bl_recent_searches") ?? "[]");
      setRecentSearches(Array.isArray(storedSearches) ? storedSearches.slice(0, 5) : []);
    } catch {}
  }, []);

  useEffect(() => {
    if (!mounted || customerCoords) return;
    let cancelled = false;
    const timer = window.setTimeout(() => {
      if (!cancelled) void detectLocation({ silent: true, automatic: true });
    }, 1800);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerCoords, mounted]);

  useEffect(() => {
    if (searchFocused || query.length >= 2 || status === "authenticated") {
      void loadMenuItems();
    }
  }, [loadMenuItems, query.length, searchFocused, status]);

  // Close search dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!searchContainerRef.current?.contains(e.target as Node)) {
        setSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Live search results from menu
  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q || q.length < 2) return [];
    return menuItems
      .filter((m) =>
        m.name.toLowerCase().includes(q) ||
        m.description?.toLowerCase().includes(q) ||
        m.categoryId.toLowerCase().includes(q)
      )
      .slice(0, 7);
  }, [menuItems, query]);

  function flashLocationError(msg: string) {
    setLocationErrorMsg(msg);
    setTimeout(() => setLocationErrorMsg(null), 3000);
  }

  function saveLocation(location: StoredDeliveryLocation, label: string) {
    setCustomerCoords({ lat: location.lat, lng: location.lng });
    setLocationLabel(label);
    setLocationErrorMsg(null);
    localStorage.setItem(DELIVERY_LOCATION_KEY, JSON.stringify(location));
    localStorage.setItem(LOCATION_COORDS_KEY, JSON.stringify({ lat: location.lat, lng: location.lng }));
    localStorage.setItem(LOCATION_LABEL_KEY, label);
  }

  function detectLocation(options?: { silent?: boolean; automatic?: boolean }) {
    if (locating) return;
    if (!("geolocation" in navigator)) {
      if (!options?.silent) flashLocationError("Location not supported");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const coords = { lat: latitude, lng: longitude };
          const location: StoredDeliveryLocation = {
            ...coords,
            accuracyM: pos.coords.accuracy ?? null,
            capturedAt: new Date(pos.timestamp || Date.now()).toISOString(),
            source: "browser_gps",
          };
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=16&addressdetails=1`,
            { headers: { Accept: "application/json" } },
          );
          const data = await res.json();
          const addr: Record<string, string> = data?.address ?? {};
          const rough = addr.suburb || addr.neighbourhood || addr.village || addr.hamlet || addr.city_district;
          const city = addr.town || addr.city || addr.county || "Deoghar";
          const label = rough ? `${rough}, ${city}` : `${city}, Jharkhand`;
          saveLocation(location, label);
        } catch {
          saveLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracyM: pos.coords.accuracy ?? null,
            capturedAt: new Date(pos.timestamp || Date.now()).toISOString(),
            source: "browser_gps",
          }, "Current location, Deoghar");
        }
        finally { setLocating(false); }
      },
      (err) => {
        setLocating(false);
        if (!options?.silent) {
          flashLocationError(err.code === err.PERMISSION_DENIED ? "Permission denied" : "Couldn't get location");
        }
      },
      { enableHighAccuracy: true, timeout: options?.automatic ? 8000 : 15000, maximumAge: 60000 },
    );
  }

  useEffect(() => {
    if (status !== "authenticated") { setLastOrderStatus("idle"); return; }
    setLastOrderStatus("loading");
    fetch("/api/orders/mine")
      .then((r) => r.json())
      .then((d) => { const o = d.orders?.[0] ?? null; setLastOrder(o); setLastOrderStatus(o ? "ready" : "empty"); })
      .catch(() => setLastOrderStatus("empty"));
    fetch("/api/account")
      .then((r) => r.json())
      .then((d) => setWalletBalance(d.account?.walletBalance ?? null))
      .catch(() => {});
  }, [status]);

  useEffect(() => {
    const t = setInterval(() => setSuggestionIndex((i) => (i + 1) % SEARCH_SUGGESTIONS.length), 2200);
    return () => clearInterval(t);
  }, []);

  function saveSearch(q: string) {
    if (!q) return;
    const updated = [q, ...recentSearches.filter((s) => s !== q)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem("bl_recent_searches", JSON.stringify(updated));
  }

  function removeRecentSearch(term: string, e: React.MouseEvent) {
    e.stopPropagation();
    const updated = recentSearches.filter((s) => s !== term);
    setRecentSearches(updated);
    localStorage.setItem("bl_recent_searches", JSON.stringify(updated));
  }

  function handleSearch(e?: React.FormEvent, overrideQuery?: string) {
    e?.preventDefault();
    const q = (overrideQuery ?? query).trim();
    saveSearch(q);
    setSearchFocused(false);
    router.push(q ? `/menu?q=${encodeURIComponent(q)}` : "/menu");
  }

  function handleResultClick(itemName: string) {
    saveSearch(itemName);
    setSearchFocused(false);
    router.push(`/menu?q=${encodeURIComponent(itemName)}`);
  }

  function handleQuickAdd(item: MenuItem) {
    if (isClosed) return;
    addItem(item);
    setSearchFocused(false);
  }

  function startVoiceSearch() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    const recognition = new SR();
    recognition.lang = "en-IN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    setIsListening(true);
    setSearchFocused(true);
    recognition.start();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      const transcript: string = event.results[0][0].transcript;
      setQuery(transcript);
      setIsListening(false);
    };
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
  }

  function reorder() {
    if (!lastOrder || isClosed) return;
    loadMenuItems().then((items) => {
      for (const line of lastOrder.items) {
        const item = items.find((m) => m.id === line.itemId);
        if (item) addItem(item, line.qty);
      }
      router.push("/cart");
    });
  }

  function handleProfileTap() {
    if (status === "authenticated") router.push("/account");
    else openLoginModal();
  }

  const eta = estimateDeliveryMinutes(customerCoords);
  const showDropdown = searchFocused && (searchResults.length > 0 || query.length === 0);

  return (
    <>
    {/* section has no overflow-hidden so the search dropdown isn't clipped */}
    <section
      className="relative bg-gradient-to-br from-brand-orange via-brand-orange-dark to-brand-gold px-4 pb-4 md:pb-5"
      style={{ paddingTop: "calc(0.75rem + env(safe-area-inset-top))" }}
    >
      {/* Floaters clipped inside their own layer — keep visual overflow off section */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        {FLOATERS.map((f, i) => (
          <span
            key={i}
            className={`hero-floater absolute select-none opacity-[0.15] drop-shadow ${f.className}`}
            style={{
              animationDelay: `${f.delay}s`,
              animationDuration: `${f.duration}s`,
            }}
          >
            {f.emoji}
          </span>
        ))}
      </div>

      <div className="relative mx-auto max-w-6xl">
        {/* ── Top row: location + icons ── */}
        <div className="mb-3 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setLocationPickerOpen(true)}
            className="flex min-w-0 items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-[12px] font-semibold text-white backdrop-blur-sm"
          >
            {locating
              ? <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" strokeWidth={2.5} />
              : <MapPin className="h-3.5 w-3.5 shrink-0" strokeWidth={2.5} />
            }
            <span className="max-w-[140px] truncate">
              {locating ? "Locating..." : locationErrorMsg ?? (customerCoords ? locationLabel : "Set delivery location")}
            </span>
            <ChevronDown className="h-3 w-3 shrink-0 opacity-80" strokeWidth={2.5} />
          </button>

          <div className="flex shrink-0 items-center gap-2">
            {mounted && status === "authenticated" && (
              <button
                type="button"
                onClick={() => router.push("/account")}
                className="price-text flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1.5 text-[11px] font-bold text-white backdrop-blur-sm"
              >
                <Wallet className="h-3.5 w-3.5" strokeWidth={2.5} />
                {formatInr(walletBalance ?? 0)}
              </button>
            )}
            {/* Notification bell */}
            <NotificationCenter />
            {/* Profile */}
            <button
              type="button"
              onClick={handleProfileTap}
              aria-label="Account"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white/20 text-white shadow-lg shadow-black/10 ring-1 ring-white/25 backdrop-blur-sm transition-transform active:scale-95"
            >
              <User className="h-5 w-5" strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* ── ETA / Closed card ── */}
        <div
          className={`flex items-center gap-3 rounded-2xl p-2.5 shadow-lg ${isClosed ? "bg-red-50 border border-red-200" : "bg-white"}`}
        >
          <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${isClosed ? "bg-red-100" : "bg-brand-orange/10"}`}>
            <Clock className={`h-5 w-5 ${isClosed ? "text-red-500" : "text-brand-orange"}`} strokeWidth={2.5} />
          </span>
          <div className="min-w-0 flex-1">
            {isClosed ? (
              <>
                <div className="flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
                  </span>
                  <p className="truncate text-[14px] font-extrabold text-red-700">Kitchen is Closed</p>
                </div>
                <p className="truncate text-[11px] text-red-500">
                  {kitchenSettings?.next_open_time ? `Opens at ${kitchenSettings.next_open_time}` : "We'll reopen soon — stay tuned!"}
                </p>
              </>
            ) : (
              <>
                <div className="flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
                  </span>
                  <p className="truncate text-[14px] font-extrabold text-gray-900">
                    {customerCoords ? `Delivery in ${eta.min}-${eta.max} min` : "Set delivery pin for ETA"}
                  </p>
                </div>
                <p className="truncate text-[11px] text-gray-500">
                  {customerCoords ? `Fastest kitchen near ${locationLabel.split(",")[0]}` : "Tap address above to drop your pin"}
                </p>
              </>
            )}
          </div>
          {isClosed ? (
            <button
              type="button"
              onClick={() => setNotifyModalOpen(true)}
              className="shrink-0 rounded-full bg-red-500 px-3 py-1.5 text-[10px] font-extrabold text-white shadow-sm transition-all hover:bg-red-600 active:scale-95"
            >
              Notify Me
            </button>
          ) : (
            <span className="shrink-0 rotate-[-3deg] rounded-full bg-ink px-2.5 py-1 text-[10px] font-extrabold text-brand-gold shadow-sm">
              🔥 ₹80 OFF
            </span>
          )}
        </div>

        <p className="mt-2 text-[13px] font-medium text-white/85">
          {greeting()}{user?.name ? `, ${user.name.split(" ")[0]}` : ""} — bhook lagi? 👋
        </p>

        {/* ── Advanced Search ── */}
        <div
          className="relative mt-3 space-y-2"
          ref={searchContainerRef}
        >
          {/* Search bar */}
          <form onSubmit={handleSearch} className="relative">
            <div className={`relative flex items-center overflow-hidden rounded-2xl bg-white shadow-[0_8px_32px_rgba(0,0,0,0.18)] ring-2 transition-all duration-200 ${searchFocused ? "ring-brand-orange/40 shadow-[0_8px_40px_rgba(0,0,0,0.28)]" : "ring-white/60"}`}>
              {/* Search icon */}
              <div className="flex h-full items-center pl-4 pr-2">
                <Search className={`h-[18px] w-[18px] transition-colors ${searchFocused ? "text-brand-orange" : "text-gray-400"}`} strokeWidth={2.5} />
              </div>

              {/* Input */}
              <input
                type="text"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setSearchFocused(true); }}
                onFocus={() => setSearchFocused(true)}
                className="flex-1 bg-transparent py-3.5 pr-2 text-[14px] font-medium text-gray-900 placeholder-transparent focus:outline-none"
                autoComplete="off"
              />

              {/* Animated placeholder */}
              {!query && (
                <div className="pointer-events-none absolute left-[52px] top-1/2 flex -translate-y-1/2 items-center gap-1.5 text-[14px] text-gray-400">
                  <span className="font-normal">Search for</span>
                  <span className="font-semibold text-gray-600">
                    &ldquo;{SEARCH_SUGGESTIONS[suggestionIndex]}&rdquo;
                  </span>
                </div>
              )}

              {/* Clear */}
              {query && (
                <button
                  type="button"
                  onClick={() => { setQuery(""); setSearchFocused(true); }}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition-transform hover:text-gray-600 active:scale-95"
                >
                  <X className="h-4 w-4" strokeWidth={2.5} />
                </button>
              )}

              {/* Mic */}
              <div className="pr-1">
                <button
                  type="button"
                  onClick={startVoiceSearch}
                  className={`flex h-9 w-9 items-center justify-center rounded-xl transition-colors ${isListening ? "bg-red-50 text-red-500" : "bg-gray-50 text-gray-400 hover:bg-gray-100"}`}
                >
                  {isListening
                    ? <span className="relative flex h-2.5 w-2.5"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" /><span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" /></span>
                    : <Mic className="h-4 w-4" strokeWidth={2} />
                  }
                </button>
              </div>

              {/* Search CTA */}
              <button
                type="submit"
                className="m-1.5 flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-orange to-brand-gold px-4 py-2 text-[13px] font-extrabold text-white shadow-md shadow-brand-orange/30 transition-all active:scale-95 hover:shadow-lg"
              >
                <Search className="h-3.5 w-3.5" strokeWidth={3} />
                Search
              </button>
            </div>
          </form>

          {/* ── Live search dropdown ── */}
          {showDropdown && (
              <div
                className="absolute left-0 right-0 top-[calc(100%+4px)] z-50 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl"
              >
                {/* Live results */}
                {searchResults.length > 0 ? (
                  <>
                    <div className="px-4 pb-1 pt-3">
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400">Results</span>
                    </div>
                    <ul>
                      {searchResults.map((item) => (
                        <li key={item.id} className="border-b border-gray-50 last:border-0">
                          <div className="flex items-center gap-3 px-4 py-2.5">
                            {/* Emoji/image */}
                            <button
                              type="button"
                              onClick={() => handleResultClick(item.name)}
                              className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gray-50 text-[22px]"
                            >
                              {item.image
                                // eslint-disable-next-line @next/next/no-img-element
                                ? <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                                : item.emoji
                              }
                            </button>

                            {/* Name + description */}
                            <button
                              type="button"
                              onClick={() => handleResultClick(item.name)}
                              className="min-w-0 flex-1 text-left"
                            >
                              <div className="flex items-center gap-1.5">
                                {item.diet && (
                                  <span className={`h-2 w-2 shrink-0 rounded-sm ${DIET_DOT[item.diet] ?? "bg-gray-300"}`} />
                                )}
                                <span className="truncate text-[13px] font-bold text-gray-900">{item.name}</span>
                              </div>
                              {item.description && (
                                <p className="mt-0.5 truncate text-[11px] text-gray-500">{item.description}</p>
                              )}
                            </button>

                            {/* Price + quick add */}
                            <div className="flex shrink-0 items-center gap-2">
                              <span className="text-[13px] font-bold text-gray-800">{formatInr(item.price)}</span>
                              <button
                                type="button"
                                onClick={() => handleQuickAdd(item)}
                                disabled={isClosed}
                                className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-orange text-white shadow-sm transition-transform active:scale-90 disabled:opacity-40 disabled:cursor-not-allowed"
                              >
                                <Plus className="h-3.5 w-3.5" strokeWidth={3} />
                              </button>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={() => handleSearch(undefined, query)}
                      className="flex w-full items-center justify-center gap-1.5 py-3 text-[12px] font-bold text-brand-orange hover:bg-orange-50"
                    >
                      <Search className="h-3.5 w-3.5" strokeWidth={2.5} />
                      See all results for &ldquo;{query}&rdquo;
                    </button>
                  </>
                ) : query.length >= 2 ? (
                  <div className="px-4 py-5 text-center text-[13px] text-gray-400">
                    No items found for &ldquo;{query}&rdquo;
                  </div>
                ) : (
                  /* Empty state: recents + trending */
                  <div className="p-2">
                    {recentSearches.length > 0 && (
                      <>
                        <p className="px-2 pb-1.5 pt-2 text-[10px] font-extrabold uppercase tracking-widest text-gray-400">
                          Recent
                        </p>
                        <ul>
                          {recentSearches.map((term) => (
                            <li key={term}>
                              <div className="flex items-center gap-2 rounded-xl px-2 py-2 hover:bg-gray-50">
                                <Clock className="h-3.5 w-3.5 shrink-0 text-gray-300" strokeWidth={2} />
                                <button
                                  type="button"
                                  onClick={() => { setQuery(term); handleSearch(undefined, term); }}
                                  className="flex-1 text-left text-[13px] font-medium text-gray-700"
                                >
                                  {term}
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => removeRecentSearch(term, e)}
                                  className="flex h-5 w-5 items-center justify-center rounded-full text-gray-300 hover:bg-gray-200 hover:text-gray-500"
                                >
                                  <X className="h-3 w-3" strokeWidth={2.5} />
                                </button>
                              </div>
                            </li>
                          ))}
                        </ul>
                        <div className="my-2 border-t border-gray-100" />
                      </>
                    )}

                    <p className="px-2 pb-1.5 text-[10px] font-extrabold uppercase tracking-widest text-gray-400">
                      Trending
                    </p>
                    <ul className="flex flex-wrap gap-2 px-2 pb-2">
                      {TRENDING_SEARCHES.map((term) => (
                        <li key={term}>
                          <button
                            type="button"
                            onClick={() => { setQuery(term); handleSearch(undefined, term); }}
                            className="flex items-center gap-1.5 rounded-full border border-gray-200 px-3 py-1.5 text-[12px] font-medium text-gray-600 transition-colors hover:border-brand-orange/40 hover:bg-orange-50 hover:text-brand-orange"
                          >
                            <TrendingUp className="h-3 w-3 text-brand-orange" strokeWidth={2.5} />
                            {term}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

          {/* Quick category pills */}
          <div className="hide-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-0.5 pr-6">
            {QUICK_CATS.map((cat) => (
              <button
                key={cat.q}
                type="button"
                onClick={() => router.push(`/menu?cat=${cat.q}`)}
                className="flex flex-shrink-0 items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 text-[11px] font-bold text-white backdrop-blur-sm transition-all hover:bg-white/30 active:scale-95"
              >
                <span className="text-[13px]">{cat.emoji}</span>
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Reorder card ── */}
        {(lastOrderStatus === "loading" || lastOrderStatus === "ready") && (
            <div
              key="reorder-slot"
              className="mt-3"
            >
              {lastOrderStatus === "loading" || !lastOrder ? (
                <div className="flex w-full animate-pulse items-center gap-3 rounded-2xl bg-white/70 p-3.5 shadow-lg">
                  <span className="h-9 w-9 shrink-0 rounded-xl bg-gray-200" />
                  <span className="min-w-0 flex-1 space-y-1.5">
                    <span className="block h-3 w-2/5 rounded bg-gray-200" />
                    <span className="block h-2.5 w-4/5 rounded bg-gray-100" />
                  </span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={reorder}
                  disabled={isClosed}
                  className="flex w-full items-center gap-3 rounded-2xl bg-white p-3.5 text-left shadow-lg transition-transform active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-orange/10 text-brand-orange">
                    <RotateCcw className="h-4 w-4" strokeWidth={2.5} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13px] font-bold text-gray-900">Reorder your last meal</span>
                    <span className="block truncate text-[12px] text-gray-500">
                      {lastOrder.items.map((i) => i.name).join(", ")}
                    </span>
                  </span>
                  <span className="shrink-0 text-gray-300">
                    <ChevronRight className="h-4 w-4" />
                  </span>
                </button>
              )}
            </div>
          )}
      </div>
    </section>

    <NotifyMeModal isOpen={notifyModalOpen} onClose={() => setNotifyModalOpen(false)} />
    <LocationPickerModal
      isOpen={locationPickerOpen}
      initialCoords={customerCoords}
      initialLabel={locationLabel}
      onClose={() => setLocationPickerOpen(false)}
      onSave={saveLocation}
    />
  </>
  );
}
