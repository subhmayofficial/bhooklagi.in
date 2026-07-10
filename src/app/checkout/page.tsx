"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin, Phone, User, Landmark,
  CheckCircle2, ChevronRight, Bike, CreditCard, Package, ChevronLeft,
  LocateFixed, AlertCircle,
} from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { useAuthStore } from "@/stores/auth-store";
import { formatInr } from "@/data/menu";
import { computeOrderTotals } from "@/lib/pricing";

type DeliveryLocation = {
  lat: number;
  lng: number;
  accuracyM: number | null;
  capturedAt: string;
};
type SavedAddress = {
  id: string;
  label: string | null;
  address: string;
  landmark: string | null;
  isDefault: boolean;
  lat: number | null;
  lng: number | null;
  accuracyM: number | null;
  locationCapturedAt: string | null;
};
type Step = 1 | 2;

const STEP_LABELS = ["Delivery", "Review & Pay"];
const MAX_LOCATION_ACCURACY_M = 250;

export default function CheckoutPage() {
  const router = useRouter();
  const lines = useCartStore((s) => s.lines);
  const clear = useCartStore((s) => s.clear);
  const { subtotal, deliveryFee, gst, grandTotal: grand } = computeOrderTotals(lines);

  const authUser = useAuthStore((s) => s.user);
  const authStatus = useAuthStore((s) => s.status);
  const openLoginModal = useAuthStore((s) => s.openLoginModal);

  const [step, setStep] = useState<Step>(1);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [landmark, setLandmark] = useState("");
  const [saveAddress, setSaveAddress] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState<SavedAddress[]>([]);
  const [deliveryLocation, setDeliveryLocation] = useState<DeliveryLocation | null>(null);
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    if (!authUser) return;
    setName((p) => p || authUser.name || "");
    setPhone((p) => p || authUser.phone.slice(-10));
  }, [authUser]);

  useEffect(() => {
    if (authStatus !== "authenticated") return;
    fetch("/api/addresses")
      .then((r) => r.json())
      .then((d) => {
        const list: SavedAddress[] = d.addresses ?? [];
        setSaved(list);
        const def = list.find((a) => a.isDefault) ?? list[0];
        if (def) {
          setAddress((p) => p || def.address);
          setLandmark((p) => p || def.landmark || "");
          if (def.lat !== null && def.lng !== null) {
            setDeliveryLocation({
              lat: def.lat,
              lng: def.lng,
              accuracyM: def.accuracyM,
              capturedAt: def.locationCapturedAt ?? new Date().toISOString(),
            });
          }
          setSaveAddress(false);
        }
      })
      .catch(() => {});
  }, [authStatus]);

  if (lines.length === 0) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center px-4 text-center">
        <p className="text-[15px] font-semibold text-gray-700">Your bag is empty.</p>
        <Link href="/menu" className="mt-6 inline-flex rounded-full bg-brand-orange px-8 py-3 text-[14px] font-bold text-white">Browse menu</Link>
      </main>
    );
  }

  // Don't gate with a full page — guest users see the form and are prompted
  // to log in via the existing OTP modal only when they try to place the order.

  function validateStep1() {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Name is required";
    if (!phone.trim()) e.phone = "Phone is required";
    else if (!/^[6-9]\d{9}$/.test(phone.trim())) e.phone = "Enter a valid 10-digit number";
    if (!address.trim()) e.address = "Delivery address is required";
    if (!deliveryLocation) e.location = "Precise GPS location is required";
    else if (deliveryLocation.accuracyM !== null && deliveryLocation.accuracyM > MAX_LOCATION_ACCURACY_M) {
      e.location = `Location is too broad (${Math.round(deliveryLocation.accuracyM)}m). Please retry near an open area.`;
    }
    return e;
  }

  async function capturePreciseLocation() {
    if (!("geolocation" in navigator)) {
      setErrors((p) => ({ ...p, location: "Location is not supported on this device." }));
      return null;
    }

    setLocating(true);
    setErrors((p) => ({ ...p, location: "" }));

    return new Promise<DeliveryLocation | null>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location: DeliveryLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracyM: position.coords.accuracy ?? null,
            capturedAt: new Date(position.timestamp || Date.now()).toISOString(),
          };

          setLocating(false);
          const accuracyM = location.accuracyM;
          if (accuracyM !== null && accuracyM > MAX_LOCATION_ACCURACY_M) {
            setDeliveryLocation(null);
            setErrors((p) => ({
              ...p,
              location: `Location is too broad (${Math.round(accuracyM)}m). Please retry near an open area.`,
            }));
            resolve(null);
            return;
          }

          setDeliveryLocation(location);
          setErrors((p) => ({ ...p, location: "" }));
          resolve(location);
        },
        (error) => {
          const message =
            error.code === error.PERMISSION_DENIED
              ? "Please allow location permission to place the order."
              : error.code === error.TIMEOUT
                ? "Location request timed out. Please retry."
                : "Could not fetch precise location. Please retry.";
          setLocating(false);
          setDeliveryLocation(null);
          setErrors((p) => ({ ...p, location: message }));
          resolve(null);
        },
        { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 },
      );
    });
  }

  async function goToStep2() {
    let currentLocation = deliveryLocation;
    if (!currentLocation) {
      currentLocation = await capturePreciseLocation();
    }

    const e = validateStep1();
    if (!currentLocation) e.location = e.location || "Precise GPS location is required";
    else if (currentLocation.accuracyM !== null && currentLocation.accuracyM > MAX_LOCATION_ACCURACY_M) {
      e.location = `Location is too broad (${Math.round(currentLocation.accuracyM)}m). Please retry near an open area.`;
    } else {
      delete e.location;
    }
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setErrors({});
    setStep(2);
  }

  async function placeOrder() {
    // If not logged in, open the OTP modal as a popup — no page redirect.
    if (authStatus !== "authenticated") {
      openLoginModal();
      return;
    }
    setPlacing(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lines,
          delivery: {
            name: name.trim(),
            phone: phone.trim(),
            address: address.trim(),
            landmark: landmark.trim() || undefined,
            location: deliveryLocation,
          },
          saveAddress,
          paymentMode: "cod",
        }),
      });
      const payload = await res.json();
      if (res.status === 401) { setPlacing(false); openLoginModal(); return; }
      if (!res.ok) throw new Error(payload?.error || "Could not place order.");
      clear();
      router.push(`/orders/${payload.order.orderNumber}`);
    } catch (err) {
      setPlacing(false);
      setErrors((p) => ({ ...p, submit: err instanceof Error ? err.message : "Could not place order." }));
      setStep(2);
    }
  }

  return (
    <main className="min-h-dvh bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-[700] border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto flex h-14 max-w-lg items-center gap-3 px-4">
          <button
            type="button"
            onClick={() => step === 1 ? router.back() : setStep(1)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600"
          >
            <ChevronLeft className="h-4 w-4" strokeWidth={2.5} />
          </button>
          <div className="flex-1">
            <p className="text-[15px] font-extrabold text-gray-900">Checkout</p>
          </div>
          {/* Step dots */}
          <div className="flex items-center gap-2">
            {STEP_LABELS.map((label, i) => {
              const s = (i + 1) as Step;
              const done = step > s;
              const active = step === s;
              return (
                <div key={s} className="flex items-center gap-1">
                  <div className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold transition-all ${done ? "bg-green-500 text-white" : active ? "bg-brand-orange text-white" : "bg-gray-200 text-gray-500"}`}>
                    {done ? <CheckCircle2 className="h-3.5 w-3.5" /> : s}
                  </div>
                  <span className={`text-[10px] font-semibold hidden sm:block ${active ? "text-brand-orange" : "text-gray-400"}`}>{label}</span>
                  {i < STEP_LABELS.length - 1 && <div className={`h-px w-4 ${done ? "bg-green-400" : "bg-gray-200"}`} />}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-lg px-4 py-5">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.22 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-orange/10">
                  <MapPin className="h-4 w-4 text-brand-orange" strokeWidth={2.5} />
                </div>
                <h2 className="text-[17px] font-extrabold text-gray-900">Where should we deliver?</h2>
              </div>

              {/* Saved addresses */}
              {saved.length > 0 && (
                <div>
                  <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-gray-500">Saved addresses</p>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {saved.map((a) => (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => {
                          setAddress(a.address);
                          setLandmark(a.landmark || "");
                          setSaveAddress(false);
                          setErrors((p) => ({ ...p, address: "", location: "" }));
                          if (a.lat !== null && a.lng !== null) {
                            setDeliveryLocation({
                              lat: a.lat,
                              lng: a.lng,
                              accuracyM: a.accuracyM,
                              capturedAt: a.locationCapturedAt ?? new Date().toISOString(),
                            });
                          } else {
                            setDeliveryLocation(null);
                          }
                        }}
                        className={`shrink-0 rounded-2xl border-2 px-3 py-2 text-left text-[12px] transition-all ${address === a.address ? "border-brand-orange bg-brand-orange/[0.04]" : "border-gray-200 bg-white"}`}
                      >
                        {a.label && <span className="block font-bold text-gray-900">{a.label}</span>}
                        <span className="block max-w-[180px] truncate text-gray-500">{a.address}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Name */}
              <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-gray-500">
                  <User className="h-3.5 w-3.5" /> Full name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: "" })); }}
                  placeholder="Your name"
                  className={`w-full rounded-xl border px-4 py-3 text-[14px] focus:outline-none focus:ring-2 transition-all ${errors.name ? "border-red-400 focus:ring-red-200" : "border-gray-200 focus:border-brand-orange focus:ring-brand-orange/20"}`}
                />
                {errors.name && <p className="mt-1 text-[12px] text-red-500">{errors.name}</p>}
              </div>

              {/* Phone */}
              <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-gray-500">
                  <Phone className="h-3.5 w-3.5" /> Mobile number *
                </label>
                <div className="flex overflow-hidden rounded-xl border border-gray-200 transition-all focus-within:border-brand-orange focus-within:ring-2 focus-within:ring-brand-orange/20">
                  <span className="flex items-center bg-gray-50 px-3 text-[14px] font-semibold text-gray-500 border-r border-gray-200">+91</span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => { setPhone(e.target.value.replace(/\D/g, "")); setErrors((p) => ({ ...p, phone: "" })); }}
                    placeholder="10-digit number"
                    className={`flex-1 px-4 py-3 text-[14px] focus:outline-none ${errors.phone ? "bg-red-50" : ""}`}
                  />
                </div>
                {errors.phone && <p className="mt-1 text-[12px] text-red-500">{errors.phone}</p>}
              </div>

              {/* Address */}
              <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-gray-500">
                  <MapPin className="h-3.5 w-3.5" /> Delivery address *
                </label>
                <textarea
                  rows={3}
                  value={address}
                  onChange={(e) => { setAddress(e.target.value); setErrors((p) => ({ ...p, address: "" })); }}
                  placeholder="House no., street, area, Deoghar"
                  className={`w-full resize-none rounded-xl border px-4 py-3 text-[14px] focus:outline-none focus:ring-2 transition-all ${errors.address ? "border-red-400 focus:ring-red-200" : "border-gray-200 focus:border-brand-orange focus:ring-brand-orange/20"}`}
                />
                {errors.address && <p className="mt-1 text-[12px] text-red-500">{errors.address}</p>}

                <div className={`mt-3 rounded-xl border px-3 py-3 ${errors.location ? "border-red-200 bg-red-50" : deliveryLocation ? "border-green-200 bg-green-50" : "border-orange-100 bg-orange-50"}`}>
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${deliveryLocation ? "bg-green-100 text-green-700" : "bg-white text-brand-orange"}`}>
                      {errors.location ? <AlertCircle className="h-4 w-4" /> : <LocateFixed className="h-4 w-4" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`text-[12px] font-extrabold ${errors.location ? "text-red-700" : deliveryLocation ? "text-green-800" : "text-orange-800"}`}>
                        {deliveryLocation ? "Precise location captured" : "Capture exact delivery pin"}
                      </p>
                      <p className={`mt-0.5 text-[11px] ${errors.location ? "text-red-600" : deliveryLocation ? "text-green-700" : "text-orange-700"}`}>
                        {errors.location ||
                          (deliveryLocation
                            ? `GPS accuracy: ${deliveryLocation.accuracyM !== null ? `~${Math.round(deliveryLocation.accuracyM)}m` : "available"}`
                            : "We need GPS permission so the rider gets the exact pin.")}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={capturePreciseLocation}
                      disabled={locating}
                      className="shrink-0 rounded-full bg-white px-3 py-1.5 text-[11px] font-bold text-brand-orange shadow-sm ring-1 ring-orange-100 disabled:opacity-60"
                    >
                      {locating ? "Fetching…" : deliveryLocation ? "Refresh" : "Use GPS"}
                    </button>
                  </div>
                </div>

                <label className="mb-1.5 mt-3 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-gray-500">
                  <Landmark className="h-3.5 w-3.5" /> Landmark (optional)
                </label>
                <input
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder="Near temple, school, etc."
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-[14px] focus:border-brand-orange focus:outline-none focus:ring-2 focus:ring-brand-orange/20 transition-all"
                />

                <label className="mt-3 flex cursor-pointer items-center gap-2.5">
                  <input type="checkbox" checked={saveAddress} onChange={(e) => setSaveAddress(e.target.checked)} className="h-4 w-4 accent-brand-orange" />
                  <span className="text-[13px] font-medium text-gray-600">Save for next time</span>
                </label>
              </div>

              <motion.button
                type="button"
                onClick={goToStep2}
                whileTap={{ scale: 0.98 }}
                className="flex w-full items-center justify-between rounded-2xl bg-gradient-to-r from-brand-orange to-brand-gold px-5 py-4 shadow-[0_8px_24px_rgba(232,93,4,0.35)] transition-all"
              >
                <span className="text-[15px] font-extrabold text-white">Continue to review</span>
                <ChevronRight className="h-5 w-5 text-white/80" strokeWidth={2.5} />
              </motion.button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.22 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-orange/10">
                  <Package className="h-4 w-4 text-brand-orange" strokeWidth={2.5} />
                </div>
                <h2 className="text-[17px] font-extrabold text-gray-900">Review your order</h2>
              </div>

              {/* Delivery summary */}
              <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-[12px] font-bold uppercase tracking-wider text-gray-500">Delivering to</p>
                  <button type="button" onClick={() => setStep(1)} className="text-[11px] font-bold text-brand-orange hover:underline">Edit</button>
                </div>
                <p className="text-[14px] font-bold text-gray-900">{name}</p>
                <p className="text-[13px] text-gray-600">{address}{landmark ? `, near ${landmark}` : ""}</p>
                <p className="text-[13px] text-gray-500">+91 {phone}</p>
                {deliveryLocation && (
                  <p className="mt-1 text-[11px] font-semibold text-green-600">
                    Exact pin captured · {deliveryLocation.accuracyM !== null ? `~${Math.round(deliveryLocation.accuracyM)}m accuracy` : "GPS"}
                  </p>
                )}
                <div className="mt-3 flex items-center gap-2 rounded-xl bg-orange-50 px-3 py-2">
                  <Bike className="h-4 w-4 text-brand-orange" strokeWidth={2} />
                  <span className="text-[12px] font-semibold text-orange-800">Estimated delivery: 25–35 minutes</span>
                </div>
              </div>

              {/* Order items */}
              <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                <p className="mb-3 text-[12px] font-bold uppercase tracking-wider text-gray-500">Your items</p>
                <ul className="space-y-2.5">
                  {lines.map((l) => (
                    <li key={l.itemId} className="flex items-center justify-between gap-2">
                      <span className="flex min-w-0 items-center gap-2">
                        <span className="text-lg">{l.emoji}</span>
                        <span className="truncate text-[13px] font-medium text-gray-800">{l.name} <span className="text-gray-400">×{l.qty}</span></span>
                      </span>
                      <span className="shrink-0 text-[13px] font-semibold text-gray-900">{formatInr(l.unitPrice * l.qty)}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 space-y-2 border-t border-gray-100 pt-3">
                  <div className="flex justify-between text-[13px] text-gray-500"><span>Item total</span><span>{formatInr(subtotal)}</span></div>
                  <div className="flex justify-between text-[13px] text-gray-500">
                    <span>Delivery</span>
                    <span className={deliveryFee === 0 ? "font-semibold text-green-600" : ""}>{deliveryFee === 0 ? "FREE 🎉" : formatInr(deliveryFee)}</span>
                  </div>
                  <div className="flex justify-between text-[13px] text-gray-500"><span>Taxes</span><span>{formatInr(gst)}</span></div>
                  <div className="flex justify-between pt-2 text-[16px] font-extrabold text-gray-900">
                    <span>Total</span><span className="text-brand-orange">{formatInr(grand)}</span>
                  </div>
                </div>
              </div>

              {/* Payment */}
              <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                <p className="mb-3 text-[12px] font-bold uppercase tracking-wider text-gray-500">Payment</p>
                <div className="flex items-center gap-3 rounded-xl border-2 border-brand-orange bg-brand-orange/[0.03] px-4 py-3">
                  <CreditCard className="h-5 w-5 text-brand-orange" strokeWidth={2} />
                  <div>
                    <p className="text-[14px] font-bold text-gray-900">Cash on Delivery</p>
                    <p className="text-[12px] text-gray-500">Pay ₹{grand.toLocaleString("en-IN")} when your order arrives</p>
                  </div>
                </div>
              </div>

              {errors.submit && (
                <p className="rounded-xl bg-red-50 px-4 py-3 text-center text-[13px] font-medium text-red-500">{errors.submit}</p>
              )}

              <motion.button
                type="button"
                onClick={placeOrder}
                disabled={placing}
                whileTap={{ scale: 0.98 }}
                className="flex w-full items-center justify-between rounded-2xl bg-gradient-to-r from-brand-orange to-brand-gold px-5 py-4 shadow-[0_8px_24px_rgba(232,93,4,0.35)] disabled:opacity-60 transition-all"
              >
                <div>
                  <p className="text-left text-[15px] font-extrabold text-white">{placing ? "Placing order…" : "Place order"}</p>
                  <p className="text-left text-[11px] text-white/70">Cash on delivery</p>
                </div>
                <span className="text-[16px] font-extrabold text-white">{formatInr(grand)}</span>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
