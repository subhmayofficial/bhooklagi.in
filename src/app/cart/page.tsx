"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Minus, Plus, Trash2, ChevronRight, ShoppingBag,
  ArrowLeft, Clock, Shield, Bike, Sparkles, CheckCircle2,
  ChevronDown, ChevronUp, MapPin, Phone, User, Landmark,
  LocateFixed, AlertCircle, CreditCard, Banknote, X, Pencil, Tag,
} from "lucide-react";

import { useCartStore, cartTotals, type CartLine } from "@/stores/cart-store";
import { menuItems, formatInr } from "@/data/menu";
import { estimateDeliveryMinutes } from "@/lib/location";
import { useAuthStore } from "@/stores/auth-store";
import { useEffect, useState } from "react";

const MAX_LOCATION_ACCURACY_M = 250;

type PaymentMode = "cod" | "upi";
type CheckoutStep = "contact" | "address";
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

const CHECKOUT_STEPS: { id: CheckoutStep; label: string; helper: string }[] = [
  { id: "contact", label: "Contact", helper: "Who is ordering?" },
  { id: "address", label: "Deliver to", helper: "Your delivery address" },
];

export default function CartPage() {
  const router    = useRouter();
  const lines     = useCartStore((s) => s.lines);
  const increment = useCartStore((s) => s.increment);
  const decrement = useCartStore((s) => s.decrement);
  const remove    = useCartStore((s) => s.remove);
  const clear     = useCartStore((s) => s.clear);
  const authUser = useAuthStore((s) => s.user);
  const authStatus = useAuthStore((s) => s.status);
  const openLoginModal = useAuthStore((s) => s.openLoginModal);
  const { subtotal, qty } = cartTotals(lines);

  const deliveryFee    = subtotal >= 299 || subtotal === 0 ? 0 : 49;
  const gst            = 0;
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountType: "percent" | "flat";
    discountValue: number;
    paymentModeRequired: string | null;
  } | null>(null);
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [showBillDetails, setShowBillDetails] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<CheckoutStep>("contact");
  const [paymentMode, setPaymentMode] = useState<PaymentMode>("upi");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [landmark, setLandmark] = useState("");
  const [saveAddress, setSaveAddress] = useState(true);
  const [saved, setSaved] = useState<SavedAddress[]>([]);
  const [deliveryLocation, setDeliveryLocation] = useState<DeliveryLocation | null>(null);
  const [locating, setLocating] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [orderNotes, setOrderNotes] = useState("");
  const [notesOpen, setNotesOpen] = useState(false);
  const [cartReady, setCartReady] = useState(false);
  const couponDiscount = appliedCoupon
    ? appliedCoupon.discountType === "percent"
      ? Math.round(subtotal * appliedCoupon.discountValue / 100)
      : appliedCoupon.discountValue
    : 0;
  const grand = Math.max(0, subtotal + deliveryFee + gst - couponDiscount);
  const freeDeliveryAt = 299;
  const progress = Math.min((subtotal / freeDeliveryAt) * 100, 100);
  const deliveryEta = estimateDeliveryMinutes(deliveryLocation);
  const checkoutStepIndex = CHECKOUT_STEPS.findIndex((step) => step.id === checkoutStep);
  const checkoutPrimaryLabel =
    checkoutStep === "contact"
      ? "Next: delivery address"
      : placing
        ? "Placing order…"
        : deliveryLocation
          ? "Place Order"
          : "Get location & Place Order";

  useEffect(() => {
    if (useCartStore.persist.hasHydrated()) setCartReady(true);
    return useCartStore.persist.onFinishHydration(() => setCartReady(true));
  }, []);

  useEffect(() => {
    if (cartReady && lines.length === 0 && !placing) router.replace("/menu");
  }, [cartReady, lines.length, placing, router]);

  useEffect(() => {
    if (!authUser) return;
    setName((previous) => previous || authUser.name || "");
    setPhone((previous) => previous || authUser.phone.slice(-10));
  }, [authUser]);

  useEffect(() => {
    if (authStatus !== "authenticated") return;
    fetch("/api/addresses")
      .then((response) => response.json())
      .then((data) => {
        const list: SavedAddress[] = data.addresses ?? [];
        setSaved(list);
        const defaultAddress = list.find((item) => item.isDefault) ?? list[0];
        if (!defaultAddress) return;
        setAddress((previous) => previous || defaultAddress.address);
        setLandmark((previous) => previous || defaultAddress.landmark || "");
        setSaveAddress(false);
        if (defaultAddress.lat !== null && defaultAddress.lng !== null) {
          setDeliveryLocation({
            lat: defaultAddress.lat,
            lng: defaultAddress.lng,
            accuracyM: defaultAddress.accuracyM,
            capturedAt: defaultAddress.locationCapturedAt ?? new Date().toISOString(),
          });
        }
      })
      .catch(() => {});
  }, [authStatus]);

  async function applyCoupon() {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    setCouponLoading(true);
    setCouponError("");
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, paymentMode, subtotal }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload?.error || "Invalid coupon.");
      setAppliedCoupon({
        code: payload.code,
        discountType: payload.discountType,
        discountValue: payload.discountValue,
        paymentModeRequired: payload.paymentModeRequired ?? null,
      });
    } catch (e) {
      setCouponError(e instanceof Error ? e.message : "Invalid coupon.");
      setAppliedCoupon(null);
    } finally {
      setCouponLoading(false);
    }
  }

  // Auto-clear coupon if payment mode changes and coupon requires a different mode
  useEffect(() => {
    if (appliedCoupon?.paymentModeRequired && appliedCoupon.paymentModeRequired !== paymentMode) {
      setAppliedCoupon(null);
      setCouponError(`Coupon ${appliedCoupon.code} requires ${appliedCoupon.paymentModeRequired.toUpperCase()} payment.`);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentMode]);

  function validateDelivery(currentLocation = deliveryLocation) {
    const nextErrors: Record<string, string> = {};
    if (!name.trim()) nextErrors.name = "Name is required";
    if (!phone.trim()) nextErrors.phone = "Phone is required";
    else if (!/^[6-9]\d{9}$/.test(phone.trim())) nextErrors.phone = "Enter a valid 10-digit number";
    if (!address.trim()) nextErrors.address = "Delivery address is required";
    if (!currentLocation) nextErrors.location = "Current location is required";
    else if (currentLocation.accuracyM !== null && currentLocation.accuracyM > MAX_LOCATION_ACCURACY_M) {
      nextErrors.location = "Location is not precise enough. Please retry near an open area.";
    }
    return nextErrors;
  }

  function validateContactStep() {
    const nextErrors: Record<string, string> = {};
    if (!name.trim()) nextErrors.name = "Name is required";
    if (!phone.trim()) nextErrors.phone = "Phone is required";
    else if (!/^[6-9]\d{9}$/.test(phone.trim())) nextErrors.phone = "Enter a valid 10-digit number";
    return nextErrors;
  }

  function validateAddressStep(currentLocation = deliveryLocation) {
    const nextErrors: Record<string, string> = {};
    if (!address.trim()) nextErrors.address = "Delivery address is required";
    if (!currentLocation) nextErrors.location = "Current location is required";
    else if (currentLocation.accuracyM !== null && currentLocation.accuracyM > MAX_LOCATION_ACCURACY_M) {
      nextErrors.location = "Location is not precise enough. Please retry near an open area.";
    }
    return nextErrors;
  }

  function stepForErrors(nextErrors: Record<string, string>): CheckoutStep {
    if (nextErrors.name || nextErrors.phone) return "contact";
    return "address";
  }

  async function captureCurrentLocation() {
    if (!("geolocation" in navigator)) {
      setErrors((previous) => ({ ...previous, location: "Location is not supported on this device." }));
      return null;
    }

    setLocating(true);
    setErrors((previous) => ({ ...previous, location: "" }));

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

          if (location.accuracyM !== null && location.accuracyM > MAX_LOCATION_ACCURACY_M) {
            setDeliveryLocation(null);
            setErrors((previous) => ({
              ...previous,
              location: "Location is not precise enough. Please retry near an open area.",
            }));
            resolve(null);
            return;
          }

          setDeliveryLocation(location);
          setErrors((previous) => ({ ...previous, location: "" }));
          resolve(location);
        },
        (error) => {
          const message =
            error.code === error.PERMISSION_DENIED
              ? "Please allow location permission to place the order."
              : error.code === error.TIMEOUT
                ? "Location request timed out. Please retry."
                : "Could not fetch current location. Please retry.";
          setLocating(false);
          setDeliveryLocation(null);
          setErrors((previous) => ({ ...previous, location: message }));
          resolve(null);
        },
        { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 },
      );
    });
  }

  function openCheckout() {
    if (authStatus !== "authenticated") {
      openLoginModal();
      return;
    }
    const contactErrors = validateContactStep();
    if (Object.keys(contactErrors).length > 0) setCheckoutStep("contact");
    else setCheckoutStep("address");
    setCheckoutOpen(true);
  }

  async function goToNextCheckoutStep() {
    setErrors((previous) => ({ ...previous, submit: "" }));

    if (checkoutStep === "contact") {
      const nextErrors = validateContactStep();
      if (Object.keys(nextErrors).length > 0) {
        setErrors((previous) => ({ ...previous, ...nextErrors }));
        return;
      }
      setErrors((previous) => ({ ...previous, name: "", phone: "" }));
      setCheckoutStep("address");
      return;
    }

    // address step — capture location then place order directly
    let currentLocation = deliveryLocation;
    if (!currentLocation) currentLocation = await captureCurrentLocation();
    const nextErrors = validateAddressStep(currentLocation);
    if (Object.keys(nextErrors).length > 0) {
      setErrors((previous) => ({ ...previous, ...nextErrors }));
      return;
    }
    setErrors((previous) => ({ ...previous, address: "", location: "" }));
    await placeOrder(currentLocation ?? undefined);
  }

  function goToPreviousCheckoutStep() {
    if (checkoutStep === "address") setCheckoutStep("contact");
  }

  async function placeOrder(overrideLocation?: DeliveryLocation) {
    if (authStatus !== "authenticated") {
      openLoginModal();
      return;
    }

    let currentLocation = overrideLocation ?? deliveryLocation;
    if (!currentLocation) currentLocation = await captureCurrentLocation();

    const nextErrors = validateDelivery(currentLocation);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setCheckoutStep(stepForErrors(nextErrors));
      setCheckoutOpen(true);
      return;
    }

    setPlacing(true);
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lines,
          delivery: {
            name: name.trim(),
            phone: phone.trim(),
            address: address.trim(),
            landmark: landmark.trim() || undefined,
            location: currentLocation,
          },
          saveAddress,
          paymentMode,
          couponCode: appliedCoupon?.code,
          notes: orderNotes.trim() || undefined,
        }),
      });
      const payload = await response.json();
      if (response.status === 401) {
        setPlacing(false);
        openLoginModal();
        return;
      }
      if (!response.ok) throw new Error(payload?.error || "Could not place order.");
      clear();
      router.push(`/orders/${payload.order.orderNumber}`);
    } catch (error) {
      setErrors((previous) => ({
        ...previous,
        submit: error instanceof Error ? error.message : "Could not place order.",
      }));
      setCheckoutOpen(true);
      setPlacing(false);
    }
  }

  return (
    <>
      {/* ── Page hero bar ── */}
      <div className="fixed left-0 right-0 top-0 z-[700] border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto flex h-14 max-w-3xl items-center gap-3 px-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition-colors hover:bg-gray-200"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={2.5} />
          </button>
          <div>
            <h1 className="text-[16px] font-extrabold text-gray-950">
              Your Bag {qty > 0 && <span className="text-brand-orange">({qty})</span>}
            </h1>
            <p className="text-[10px] font-semibold text-gray-500">Bhook Lagi · Deoghar</p>
          </div>
        </div>
      </div>

      <main className="min-h-screen bg-[#f7f2ee] pb-44 pt-[80px] md:pb-36">
        <div className="mx-auto max-w-3xl px-4">

          {/* ════════════════════ EMPTY STATE ════════════════════ */}
          <AnimatePresence>
            {lines.length === 0 && cartReady && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center rounded-3xl border-2 border-dashed border-gray-300 bg-white py-20 text-center shadow-sm"
              >
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <ShoppingBag className="h-16 w-16 text-gray-300" strokeWidth={1.2} />
                </motion.div>
                <p className="mt-5 text-[18px] font-extrabold text-gray-900">Your bag is empty</p>
                <p className="mt-1 text-[13px] font-medium text-gray-500">Add some delicious food to get started</p>
                <Link
                  href="/menu"
                  className="mt-7 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-brand-orange to-brand-gold px-8 py-3.5 text-[14px] font-extrabold text-white shadow-lg shadow-brand-orange/30 transition-all hover:shadow-xl active:scale-95"
                >
                  <ShoppingBag className="h-4 w-4" strokeWidth={2.5} />
                  Browse menu
                </Link>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ════════════════════ CART CONTENT ════════════════════ */}
          {lines.length > 0 && (
            <div className="space-y-3">

              {/* ── Free delivery progress bar ── */}
              {subtotal < freeDeliveryAt && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="overflow-hidden rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bike className="h-4 w-4 text-amber-600" strokeWidth={2} />
                      <p className="text-[12px] font-bold text-amber-800">
                        Add <span className="price-text text-amber-600">{formatInr(freeDeliveryAt - subtotal)}</span> more for free delivery
                      </p>
                    </div>
                    <span className="text-[10px] font-bold text-amber-500">
                      {Math.round(progress)}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-amber-200">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      className="h-full rounded-full bg-gradient-to-r from-amber-500 to-brand-orange"
                    />
                  </div>
                </motion.div>
              )}
              {subtotal >= freeDeliveryAt && (
                <div className="flex items-center gap-2.5 rounded-2xl border border-green-100 bg-green-50 px-4 py-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600" strokeWidth={2} />
                  <p className="text-[13px] font-extrabold text-green-800">🎉 You&apos;ve unlocked free delivery!</p>
                </div>
              )}

              {/* ── Restaurant info strip ── */}
              <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3.5 shadow-sm">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-orange/10 text-[20px]">🍔</span>
                <div className="flex-1">
                  <p className="text-[13px] font-extrabold text-gray-950">Bhook Lagi</p>
                  <p className="text-[11px] font-medium text-gray-500">Street food · Deoghar, Jharkhand</p>
                </div>
                <div className="flex items-center gap-1 rounded-xl bg-green-50 px-2.5 py-1">
                  <Clock className="h-3 w-3 text-green-600" strokeWidth={2} />
                  <span className="text-[11px] font-bold text-green-700">
                    {deliveryLocation ? `${deliveryEta.min}-${deliveryEta.max} min` : "Live ETA"}
                  </span>
                </div>
              </div>

              {/* ── Cart items card ── */}
              <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-4 py-3">
                  <p className="text-[11px] font-extrabold uppercase tracking-widest text-gray-600">
                    Items · {qty} added
                  </p>
                  <Link href="/menu" className="text-[11px] font-bold text-brand-orange hover:underline">
                    + Add more
                  </Link>
                </div>

                <AnimatePresence initial={false}>
                  {lines.map((line) => (
                    <CartRow
                      key={line.itemId}
                      line={line}
                      onInc={() => increment(line.itemId)}
                      onDec={() => decrement(line.itemId)}
                      onRemove={() => remove(line.itemId)}
                    />
                  ))}
                </AnimatePresence>
              </div>

              {/* ── Coupon code ── */}
              <div className="relative overflow-hidden rounded-2xl border-2 border-dashed border-orange-200 bg-white shadow-sm">
                {/* Ticket notches */}
                <div className="pointer-events-none absolute -left-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-[#f7f2ee]" />
                <div className="pointer-events-none absolute -right-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-[#f7f2ee]" />
                <div className="p-4">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-orange/10">
                        <Tag className="h-4 w-4 text-brand-orange" strokeWidth={2} />
                      </span>
                      <div>
                        <p className="text-[14px] font-extrabold text-gray-950">
                          {appliedCoupon ? "Coupon applied 🎉" : "Apply coupon"}
                        </p>
                        <p className="text-[11px] font-semibold text-orange-500">
                          {paymentMode === "upi" ? "💡 UPI5 — 5% off on UPI" : "💡 BHOOK20 — ₹80 off on ₹299+"}
                        </p>
                      </div>
                    </div>
                    {appliedCoupon && (
                      <button
                        type="button"
                        onClick={() => { setAppliedCoupon(null); setCouponInput(""); setCouponError(""); }}
                        className="rounded-lg border border-red-200 bg-red-50 px-3 py-1 text-[11px] font-extrabold text-red-500 hover:bg-red-100 transition-colors"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <AnimatePresence mode="wait">
                    {appliedCoupon ? (
                      <motion.div
                        key="applied"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        className="flex items-center gap-2 rounded-xl bg-green-50 px-3 py-2.5"
                      >
                        <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-green-600" strokeWidth={2.5} />
                        <div>
                          <p className="text-[13px] font-extrabold text-green-800">{appliedCoupon.code}</p>
                          <p className="text-[11px] font-semibold text-green-600">
                            {appliedCoupon.discountType === "percent"
                              ? `${appliedCoupon.discountValue}% off — ${formatInr(couponDiscount)} saved!`
                              : `${formatInr(appliedCoupon.discountValue)} off!`}
                          </p>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="input"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        className="flex gap-2"
                      >
                        <input
                          type="text"
                          value={couponInput}
                          onChange={(e) => { setCouponInput(e.target.value.toUpperCase()); setCouponError(""); }}
                          onKeyDown={(e) => { if (e.key === "Enter") applyCoupon(); }}
                          placeholder="Enter coupon code"
                          className="flex-1 rounded-xl border-2 border-gray-200 bg-gray-50 px-3 py-2.5 text-[13px] font-bold text-gray-900 uppercase tracking-wider placeholder:text-gray-400 placeholder:normal-case placeholder:tracking-normal focus:border-brand-orange focus:outline-none focus:ring-2 focus:ring-brand-orange/20 transition-all"
                        />
                        <button
                          type="button"
                          onClick={applyCoupon}
                          disabled={!couponInput || couponLoading}
                          className="rounded-xl bg-brand-orange px-5 py-2.5 text-[13px] font-extrabold text-white disabled:opacity-40 hover:bg-brand-orange-dark active:scale-95 transition-all"
                        >
                          {couponLoading ? "…" : "Apply"}
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <AnimatePresence>
                    {couponError && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-2 text-[12px] font-semibold text-red-500"
                      >
                        ⚠ {couponError}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* ── Order instructions ── */}
              <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                <button
                  type="button"
                  onClick={() => setNotesOpen((v) => !v)}
                  className="flex w-full items-center justify-between px-4 py-3.5"
                >
                  <div className="flex items-center gap-2.5">
                    <Pencil className="h-4 w-4 text-gray-500" strokeWidth={2} />
                    <span className="text-[14px] font-bold text-gray-800">
                      {orderNotes ? "Instructions added" : "Add cooking instructions"}
                    </span>
                    {orderNotes && (
                      <span className="rounded-full bg-brand-orange/10 px-2 py-0.5 text-[10px] font-bold text-brand-orange">
                        Added
                      </span>
                    )}
                  </div>
                  {notesOpen
                    ? <ChevronUp className="h-4 w-4 text-gray-400" strokeWidth={2.5} />
                    : <ChevronDown className="h-4 w-4 text-gray-400" strokeWidth={2.5} />
                  }
                </button>
                <AnimatePresence initial={false}>
                  {notesOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-gray-100 px-4 pb-4 pt-3">
                        <textarea
                          rows={3}
                          value={orderNotes}
                          onChange={(e) => setOrderNotes(e.target.value)}
                          placeholder="E.g. Less spicy, no onion, extra sauce…"
                          maxLength={500}
                          className="w-full resize-none rounded-xl border border-gray-200 px-3 py-2.5 text-[13px] text-gray-800 placeholder:text-gray-400 focus:border-brand-orange focus:outline-none focus:ring-2 focus:ring-brand-orange/20 transition-all"
                        />
                        <p className="mt-1 text-right text-[10px] text-gray-400">{orderNotes.length}/500</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* ── Bill details card ── */}
              <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                <button
                  type="button"
                  onClick={() => setShowBillDetails((v) => !v)}
                  className="flex w-full items-center justify-between px-4 py-3.5"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-brand-orange" strokeWidth={2} />
                    <span className="text-[16px] font-extrabold text-gray-950">
                      Total Bill <span className="price-text text-gray-400 line-through">{appliedCoupon ? formatInr(subtotal + deliveryFee + gst) : ""}</span>{" "}
                      <span className="price-text">{formatInr(grand)}</span>
                    </span>
                    {appliedCoupon && <span className="rounded-md bg-blue-50 px-2 py-1 text-[11px] font-bold text-blue-600">Saved {formatInr(couponDiscount)}</span>}
                  </div>
                  {showBillDetails
                    ? <ChevronUp className="h-4 w-4 text-gray-400" strokeWidth={2.5} />
                    : <ChevronDown className="h-4 w-4 text-gray-400" strokeWidth={2.5} />
                  }
                </button>

                <AnimatePresence initial={false}>
                  {showBillDetails && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22 }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-2.5 border-t border-gray-100 px-4 pb-4 pt-3">
                        <BillRow label="Item total" value={formatInr(subtotal)} />
                        <BillRow
                          label="Delivery charge"
                          value={deliveryFee === 0 ? "FREE" : formatInr(deliveryFee)}
                          hint={deliveryFee > 0 ? "Free above ₹299" : undefined}
                          green={deliveryFee === 0}
                        />
                        {appliedCoupon && (
                          <BillRow label={`Coupon (${appliedCoupon.code})`} value={`-${formatInr(couponDiscount)}`} green />
                        )}
                        <div className="my-1 h-px bg-gray-200" />
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[15px] font-extrabold text-gray-950">To pay</span>
                          <span className="price-text text-[24px] font-black leading-none text-brand-orange">
                            {formatInr(grand)}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {!showBillDetails && (
                  <div className="flex items-center justify-between border-t border-gray-50 px-4 py-3">
                    <span className="text-[13px] font-bold text-gray-700">Total</span>
                    <span className="price-text text-[20px] font-black text-brand-orange">{formatInr(grand)}</span>
                  </div>
                )}
              </div>

              {/* ── Safety note ── */}
              <div className="flex items-center gap-2.5 rounded-2xl border border-green-100 bg-green-50 px-4 py-3">
                <Shield className="h-4 w-4 flex-shrink-0 text-green-600" strokeWidth={2} />
                <p className="text-[11px] leading-relaxed text-green-900">
                  <span className="font-extrabold text-green-800">100% safe & hygienic.</span>{" "}
                  Freshly prepared after order placement. No pre-cooked batches.
                </p>
              </div>

            </div>
          )}
        </div>
      </main>

      {/* ════════ STICKY CHECKOUT BAR ════════ */}
      <AnimatePresence>
        {lines.length > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 340, damping: 32 }}
            className="fixed bottom-0 left-0 right-0 z-[800] border-t border-gray-800/10 bg-[#1f1f27]/95 px-4 py-3 text-white shadow-[0_-14px_44px_rgba(15,23,42,0.22)] backdrop-blur-md md:bottom-0"
            style={{ paddingBottom: "max(12px, env(safe-area-inset-bottom))" }}
          >
            <div className="mx-auto max-w-3xl space-y-3">
              <p className="text-[15px] font-bold text-white/95">Bhook Lagi Wallet Balance: ₹0 · Add money</p>
              <div className="flex items-center gap-3">
                <PaymentSelector paymentMode={paymentMode} onChange={setPaymentMode} />

                <button
                  type="button"
                  onClick={openCheckout}
                  disabled={placing}
                  className="group relative flex flex-1 items-center justify-between overflow-hidden rounded-2xl bg-gradient-to-r from-brand-orange to-brand-gold px-4 py-3.5 shadow-[0_8px_28px_rgba(232,93,4,0.4)] transition-all active:scale-[0.99] disabled:opacity-70"
                >
                  <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                  <div className="relative text-left">
                    <p className="price-text text-[18px] font-black leading-none text-white">{formatInr(grand)}</p>
                    <p className="mt-0.5 text-[10px] font-black uppercase tracking-widest text-white/75">Total</p>
                  </div>
                  <div className="relative flex items-center gap-1.5">
                    <span className="text-[17px] font-extrabold text-white">{placing ? "Placing..." : "Place Order"}</span>
                    <ChevronRight className="h-5 w-5 text-white/85" strokeWidth={3} />
                  </div>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {checkoutOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[900] flex items-end bg-black/45 px-3 pb-3 backdrop-blur-sm"
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 280, damping: 30 }}
              className="relative mx-auto flex max-h-[90dvh] w-full max-w-3xl flex-col overflow-hidden rounded-t-[32px] bg-white shadow-2xl md:rounded-[32px]"
            >
              <div className="border-b border-gray-100 bg-white px-4 pb-4 pt-3">
                <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-gray-200" />
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[18px] font-extrabold text-gray-950">Delivery details</p>
                    <p className="text-[12px] font-semibold text-gray-500">
                      One easy step at a time — no long form stress.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCheckoutOpen(false)}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-600"
                    aria-label="Close"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  {CHECKOUT_STEPS.map((step, index) => {
                    const active = index === checkoutStepIndex;
                    const complete = index < checkoutStepIndex;
                    return (
                      <button
                        key={step.id}
                        type="button"
                        onClick={() => {
                          if (index <= checkoutStepIndex) setCheckoutStep(step.id);
                        }}
                        className="relative rounded-2xl border border-gray-100 bg-gray-50 px-2.5 py-2 text-left disabled:cursor-default"
                        disabled={index > checkoutStepIndex}
                      >
                        {index > 0 && (
                          <span
                            aria-hidden
                            className={`absolute -left-2 top-5 h-0.5 w-4 ${index <= checkoutStepIndex ? "bg-brand-orange" : "bg-gray-200"}`}
                          />
                        )}
                        <span className={`mb-1 flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-black ${complete ? "bg-green-500 text-white" : active ? "bg-brand-orange text-white" : "bg-white text-gray-400"}`}>
                          {complete ? <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={3} /> : index + 1}
                        </span>
                        <span className={`block text-[11px] font-extrabold ${active ? "text-gray-950" : "text-gray-500"}`}>
                          {step.label}
                        </span>
                        <span className="hidden text-[9px] font-semibold text-gray-400 sm:block">{step.helper}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-4">
                <AnimatePresence mode="wait" initial={false}>
                  {checkoutStep === "contact" && (
                    <motion.div
                      key="contact-step"
                      initial={{ opacity: 0, x: 18 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -18 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-4"
                    >
                      <div className="rounded-3xl bg-gradient-to-br from-orange-50 to-amber-50 p-4">
                        <p className="text-[17px] font-extrabold text-gray-950">Who should we call?</p>
                        <p className="mt-1 text-[12px] font-semibold text-gray-500">
                          We only need this to coordinate delivery smoothly.
                        </p>
                      </div>

                <FieldCard label="Full name" icon={<User className="h-3.5 w-3.5" />} error={errors.name}>
                  <input
                    type="text"
                    value={name}
                    onChange={(event) => { setName(event.target.value); setErrors((previous) => ({ ...previous, name: "" })); }}
                    placeholder="Your name"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-[16px] focus:border-brand-orange focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
                  />
                </FieldCard>

                <FieldCard label="Mobile number" icon={<Phone className="h-3.5 w-3.5" />} error={errors.phone}>
                  <div className="flex overflow-hidden rounded-xl border border-gray-200 focus-within:border-brand-orange focus-within:ring-2 focus-within:ring-brand-orange/20">
                    <span className="flex items-center border-r border-gray-200 bg-gray-50 px-3 text-[14px] font-semibold text-gray-500">+91</span>
                    <input
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      value={phone}
                      onChange={(event) => { setPhone(event.target.value.replace(/\D/g, "")); setErrors((previous) => ({ ...previous, phone: "" })); }}
                      placeholder="10-digit number"
                      className="flex-1 px-4 py-3 text-[16px] focus:outline-none"
                    />
                  </div>
                </FieldCard>

                    </motion.div>
                  )}

                  {checkoutStep === "address" && (
                    <motion.div
                      key="address-fields-step"
                      initial={{ opacity: 0, x: 18 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -18 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-4"
                    >

                {saved.length > 0 && (
                  <div>
                    <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-gray-500">Saved addresses</p>
                    <div className="hide-scrollbar flex gap-2 overflow-x-auto pb-1">
                      {saved.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            setAddress(item.address);
                            setLandmark(item.landmark || "");
                            setSaveAddress(false);
                            setErrors((previous) => ({ ...previous, address: "", location: "" }));
                            if (item.lat !== null && item.lng !== null) {
                              setDeliveryLocation({
                                lat: item.lat,
                                lng: item.lng,
                                accuracyM: item.accuracyM,
                                capturedAt: item.locationCapturedAt ?? new Date().toISOString(),
                              });
                            } else {
                              setDeliveryLocation(null);
                            }
                          }}
                          className={`shrink-0 rounded-2xl border px-3 py-2 text-left text-[12px] ${address === item.address ? "border-brand-orange bg-orange-50" : "border-gray-200 bg-white"}`}
                        >
                          {item.label && <span className="block font-bold text-gray-900">{item.label}</span>}
                          <span className="block max-w-[180px] truncate text-gray-500">{item.address}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <FieldCard label="Delivery address" icon={<MapPin className="h-3.5 w-3.5" />} error={errors.address}>
                  <textarea
                    rows={3}
                    value={address}
                    onChange={(event) => { setAddress(event.target.value); setErrors((previous) => ({ ...previous, address: "" })); }}
                    placeholder="House no., street, area, Deoghar"
                    className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-[16px] focus:border-brand-orange focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
                  />
                </FieldCard>

                <div className={`rounded-2xl border px-4 py-3 ${errors.location ? "border-red-200 bg-red-50" : deliveryLocation ? "border-green-200 bg-green-50" : "border-orange-100 bg-orange-50"}`}>
                  <div className="flex items-start gap-3">
                    <span className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${errors.location ? "bg-red-100 text-red-600" : deliveryLocation ? "bg-green-100 text-green-700" : "bg-white text-brand-orange"}`}>
                      {errors.location ? <AlertCircle className="h-4 w-4" /> : <LocateFixed className="h-4 w-4" />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className={`text-[13px] font-extrabold ${errors.location ? "text-red-700" : deliveryLocation ? "text-green-800" : "text-orange-800"}`}>
                        {deliveryLocation ? "Current location captured" : "Get current location"}
                      </p>
                      <p className={`mt-0.5 text-[12px] ${errors.location ? "text-red-600" : deliveryLocation ? "text-green-700" : "text-orange-700"}`}>
                        {errors.location || (deliveryLocation ? `Delivery in ${deliveryEta.min}-${deliveryEta.max} minutes` : "Required for live ETA and rider directions")}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={captureCurrentLocation}
                      disabled={locating}
                      className="shrink-0 rounded-full bg-white px-3 py-1.5 text-[11px] font-bold text-brand-orange shadow-sm ring-1 ring-orange-100 disabled:opacity-60"
                    >
                      {locating ? "Fetching..." : deliveryLocation ? "Refresh" : "Get current location"}
                    </button>
                  </div>
                </div>

                <FieldCard label="Landmark" icon={<Landmark className="h-3.5 w-3.5" />}>
                  <input
                    type="text"
                    value={landmark}
                    onChange={(event) => setLandmark(event.target.value)}
                    placeholder="Near temple, school, etc."
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-[16px] focus:border-brand-orange focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
                  />
                </FieldCard>

                <label className="flex cursor-pointer items-center gap-2.5">
                  <input type="checkbox" checked={saveAddress} onChange={(event) => setSaveAddress(event.target.checked)} className="h-4 w-4 accent-brand-orange" />
                  <span className="text-[13px] font-medium text-gray-600">Save this address for next time</span>
                </label>

                    </motion.div>
                  )}

                </AnimatePresence>

                {errors.submit && (
                  <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-center text-[13px] font-semibold text-red-500">{errors.submit}</p>
                )}
              </div>

              <div
                className="border-t border-gray-100 bg-white px-4 py-3"
                style={{ paddingBottom: "max(12px, env(safe-area-inset-bottom))" }}
              >
                <div className="flex items-center gap-3">
                  {checkoutStep !== "contact" && (
                    <button
                      type="button"
                      onClick={goToPreviousCheckoutStep}
                      disabled={placing || locating}
                      className="rounded-2xl border border-gray-200 px-4 py-3 text-[13px] font-extrabold text-gray-700 disabled:opacity-50"
                    >
                      Back
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={goToNextCheckoutStep}
                    disabled={placing || locating}
                    className="flex flex-1 items-center justify-between rounded-2xl bg-gradient-to-r from-brand-orange to-brand-gold px-5 py-4 text-white shadow-[0_8px_28px_rgba(232,93,4,0.35)] disabled:opacity-70"
                  >
                    <span className="text-[14px] font-extrabold">{checkoutPrimaryLabel}</span>
                    <span className="price-text text-[16px] font-black">{formatInr(grand)}</span>
                  </button>
                </div>
              </div>

              {/* Fun placing overlay */}
              <AnimatePresence>
                {placing && <PlacingOverlay />}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ── Placing order overlay ────────────────────────────────────── */
const PLACING_TIPS = [
  "Freshly made after every order 🍳",
  "No pre-cooked batches, ever! 🔥",
  "Your rider is on standby 🛵",
  "Chef is on it right now 👨‍🍳",
  "Packing with love 💛",
];
const FOOD_EMOJIS = ["🍔", "🌮", "🍟", "🍕", "🥙", "🌯"];

function PlacingOverlay() {
  const [tipIndex, setTipIndex] = useState(0);
  const [emojiIndex, setEmojiIndex] = useState(0);

  useEffect(() => {
    const tipTimer = setInterval(() => setTipIndex((i) => (i + 1) % PLACING_TIPS.length), 2200);
    const emojiTimer = setInterval(() => setEmojiIndex((i) => (i + 1) % FOOD_EMOJIS.length), 600);
    return () => { clearInterval(tipTimer); clearInterval(emojiTimer); };
  }, []);

  return (
    <motion.div
      key="placing-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="absolute inset-0 z-50 flex flex-col items-center justify-center rounded-3xl bg-white/95 backdrop-blur-sm"
    >
      <motion.div
        key={emojiIndex}
        initial={{ scale: 0.4, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 1.4, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="text-[64px] leading-none"
      >
        {FOOD_EMOJIS[emojiIndex]}
      </motion.div>

      <div className="mt-5 flex items-center gap-2">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-brand-orange/20 border-t-brand-orange" />
        <p className="text-[14px] font-extrabold text-gray-950">Placing your order…</p>
      </div>

      <AnimatePresence mode="wait">
        <motion.p
          key={tipIndex}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.3 }}
          className="mt-3 max-w-[220px] text-center text-[12px] font-semibold text-gray-500"
        >
          {PLACING_TIPS[tipIndex]}
        </motion.p>
      </AnimatePresence>
    </motion.div>
  );
}

/* ── Cart row ─────────────────────────────────────────────────── */
function CartRow({
  line, onInc, onDec, onRemove,
}: { line: CartLine; onInc: () => void; onDec: () => void; onRemove: () => void }) {
  const menuItem = menuItems.find((m) => m.id === line.itemId);
  const dietColor = menuItem?.diet === "veg" ? "border-green-500 bg-green-50"
    : menuItem?.diet === "egg" ? "border-amber-500 bg-amber-50"
    : menuItem?.diet === "non-veg" ? "border-red-500 bg-red-50" : null;
  const dotColor = menuItem?.diet === "veg" ? "bg-green-500"
    : menuItem?.diet === "egg" ? "bg-amber-500"
    : menuItem?.diet === "non-veg" ? "bg-red-500" : null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 20, height: 0 }}
      transition={{ duration: 0.22 }}
      className="flex items-center gap-3 border-b border-gray-50 px-4 py-4 last:border-0"
    >
      {/* Food image */}
      <div className="relative h-[60px] w-[60px] flex-shrink-0 overflow-hidden rounded-xl bg-brand-cream shadow-sm">
        {line.image ? (
          <Image src={line.image} alt={line.name} fill sizes="60px" className="object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[28px]">{line.emoji}</div>
        )}
        {/* Diet indicator */}
        {dietColor && dotColor && (
          <span className={`absolute left-0.5 top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-sm border-[1.5px] bg-white ${dietColor.split(" ")[0]}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />
          </span>
        )}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-bold text-gray-900">{line.name}</p>
        <p className="price-text text-[11px] text-gray-400">{formatInr(line.unitPrice)} each</p>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-1.5 rounded-xl bg-brand-orange px-2 py-1.5 shadow-sm shadow-brand-orange/20">
        <button
          type="button"
          aria-label="Decrease"
          onClick={onDec}
          className="flex h-6 w-6 items-center justify-center rounded-lg bg-white/20 text-white transition-colors hover:bg-white/30 active:scale-90"
        >
          <Minus className="h-3.5 w-3.5" strokeWidth={3} />
        </button>
        <span className="min-w-[1.2rem] text-center text-[13px] font-extrabold text-white">{line.qty}</span>
        <button
          type="button"
          aria-label="Increase"
          onClick={onInc}
          className="flex h-6 w-6 items-center justify-center rounded-lg bg-white/20 text-white transition-colors hover:bg-white/30 active:scale-90"
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={3} />
        </button>
      </div>

      {/* Line total + delete */}
      <div className="w-[52px] text-right">
        <p className="price-text text-[13px] font-black text-gray-900">{formatInr(line.unitPrice * line.qty)}</p>
        <button
          type="button"
          onClick={onRemove}
          className="mt-0.5 text-gray-300 transition-colors hover:text-red-500"
          aria-label="Remove"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </motion.div>
  );
}

/* ── Bill row ─────────────────────────────────────────────────── */
function BillRow({ label, value, hint, green }: { label: string; value: string; hint?: string; green?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-[12px] text-gray-600">{label}</p>
        {hint && <p className="text-[10px] text-gray-400">{hint}</p>}
      </div>
      <p className={`text-[12px] font-semibold ${green ? "text-green-600" : "text-gray-900"}`}>{value}</p>
    </div>
  );
}

function PaymentSelector({
  paymentMode,
  onChange,
}: {
  paymentMode: PaymentMode;
  onChange: (mode: PaymentMode) => void;
}) {
  return (
    <div className="min-w-[135px] rounded-2xl bg-white/5 px-1 py-1 ring-1 ring-white/10">
      <p className="px-2 pt-1 text-[9px] font-black uppercase tracking-widest text-white/45">Pay using</p>
      <div className="mt-1 grid grid-cols-2 gap-1">
        <button
          type="button"
          onClick={() => onChange("cod")}
          className={`flex items-center justify-center gap-1 rounded-xl px-2 py-2 text-[11px] font-extrabold transition-colors ${paymentMode === "cod" ? "bg-white text-gray-950" : "text-white/65"}`}
        >
          <Banknote className="h-3.5 w-3.5" />
          COD
        </button>
        <button
          type="button"
          onClick={() => onChange("upi")}
          className={`flex items-center justify-center gap-1 rounded-xl px-2 py-2 text-[11px] font-extrabold transition-colors ${paymentMode === "upi" ? "bg-white text-gray-950" : "text-white/65"}`}
        >
          <CreditCard className="h-3.5 w-3.5" />
          UPI
        </button>
      </div>
    </div>
  );
}

function FieldCard({
  children,
  error,
  icon,
  label,
}: {
  children: React.ReactNode;
  error?: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-gray-500">
        {icon} {label}
      </label>
      {children}
      {error && <p className="mt-1 text-[12px] font-semibold text-red-500">{error}</p>}
    </div>
  );
}
// comment to force new compression stream
