"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronLeft, MapPin, Phone, User, Landmark, CreditCard, Bike, Lock } from "lucide-react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { useCartStore } from "@/stores/cart-store";
import { useAuthStore } from "@/stores/auth-store";
import { formatInr } from "@/data/menu";
import { computeOrderTotals } from "@/lib/pricing";

type PaymentMode = "cod" | "online_bypassed";
type SavedAddress = { id: string; label: string | null; address: string; landmark: string | null; isDefault: boolean };

export default function CheckoutPage() {
  const router = useRouter();
  const lines     = useCartStore((s) => s.lines);
  const clear     = useCartStore((s) => s.clear);
  const { subtotal, deliveryFee, gst, grandTotal: grand } = computeOrderTotals(lines);

  const authUser       = useAuthStore((s) => s.user);
  const authStatus     = useAuthStore((s) => s.status);
  const openLoginModal = useAuthStore((s) => s.openLoginModal);

  const [name,        setName]        = useState("");
  const [phone,       setPhone]       = useState("");
  const [address,     setAddress]     = useState("");
  const [landmark,    setLandmark]    = useState("");
  const [saveAddress, setSaveAddress] = useState(true);
  const [payment,     setPayment]     = useState<PaymentMode>("cod");
  const [placing,     setPlacing]     = useState(false);
  const [errors,      setErrors]      = useState<Record<string, string>>({});
  const [saved,       setSaved]       = useState<SavedAddress[]>([]);

  useEffect(() => {
    if (!authUser) return;
    setName((prev) => prev || authUser.name || "");
    setPhone((prev) => prev || authUser.phone.slice(-10));
  }, [authUser]);

  useEffect(() => {
    if (authStatus !== "authenticated") return;
    fetch("/api/addresses")
      .then((r) => r.json())
      .then((d) => {
        const list: SavedAddress[] = d.addresses ?? [];
        setSaved(list);
        // Prefill with the default/most-recent saved address, if any.
        const def = list.find((a) => a.isDefault) ?? list[0];
        if (def) {
          setAddress((prev) => prev || def.address);
          setLandmark((prev) => prev || def.landmark || "");
          setSaveAddress(false); // already saved
        }
      })
      .catch(() => {});
  }, [authStatus]);

  function applySavedAddress(a: SavedAddress) {
    setAddress(a.address);
    setLandmark(a.landmark || "");
    setSaveAddress(false);
    setErrors((p) => ({ ...p, address: "" }));
  }

  if (lines.length === 0) {
    return (
      <>
        <SiteHeader />
        <main className="mx-auto max-w-lg px-4 pb-28 pt-24 text-center">
          <p className="text-[15px] font-semibold text-gray-700">Your bag is empty.</p>
          <Link
            href="/menu"
            className="mt-6 inline-flex rounded-full bg-brand-orange px-8 py-3 text-[14px] font-bold text-white"
          >
            Browse menu
          </Link>
        </main>
      </>
    );
  }

  // Ordering requires login. Prompt the guest to log in before checkout.
  if (authStatus === "guest") {
    return (
      <>
        <SiteHeader />
        <main className="mx-auto max-w-lg px-4 pb-28 pt-28 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-orange/10">
            <Lock className="h-6 w-6 text-brand-orange" />
          </div>
          <h1 className="mt-5 text-[19px] font-bold text-gray-900">Log in to checkout</h1>
          <p className="mx-auto mt-2 max-w-xs text-[14px] text-gray-500">
            Verify your mobile number to place the order and track it.
          </p>
          <button
            type="button"
            onClick={openLoginModal}
            className="mt-6 inline-flex rounded-full bg-brand-orange px-8 py-3 text-[14px] font-bold text-white shadow-[0_8px_24px_rgba(232,93,4,0.35)] hover:bg-brand-orange-dark"
          >
            Log in with OTP
          </button>
        </main>
      </>
    );
  }

  if (authStatus === "loading") {
    return (
      <>
        <SiteHeader />
        <main className="mx-auto max-w-lg px-4 pb-28 pt-28 text-center">
          <p className="text-[14px] text-gray-400">Loading…</p>
        </main>
      </>
    );
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!name.trim())    e.name    = "Name is required";
    if (!phone.trim())   e.phone   = "Phone number is required";
    else if (!/^[6-9]\d{9}$/.test(phone.trim())) e.phone = "Enter a valid 10-digit mobile number";
    if (!address.trim()) e.address = "Delivery address is required";
    return e;
  }

  async function placeOrder() {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }

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
          },
          saveAddress,
          paymentMode: "cod",
        }),
      });
      const payload = await res.json();
      if (res.status === 401) {
        setPlacing(false);
        openLoginModal();
        return;
      }
      if (!res.ok) throw new Error(payload?.error || "Could not place order.");

      clear();
      router.push(`/orders/${payload.order.orderNumber}`);
    } catch (err) {
      setPlacing(false);
      setErrors((p) => ({ ...p, submit: err instanceof Error ? err.message : "Could not place order." }));
    }
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-4 pb-28 pt-20 md:pb-16 md:pt-24">

        {/* Back */}
        <Link
          href="/cart"
          className="mb-6 inline-flex items-center gap-1.5 text-[13px] font-semibold text-gray-500 hover:text-gray-800 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" strokeWidth={2.5} />
          Back to bag
        </Link>

        <h1 className="mb-6 text-[22px] font-bold text-gray-900">Checkout</h1>

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          {/* Left: form */}
          <div className="space-y-4">

            {/* Delivery details */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-brand-orange" />
                <h2 className="text-[15px] font-bold text-gray-900">Delivery details</h2>
              </div>

              <div className="space-y-3">
                {/* Name */}
                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wide text-gray-500">
                    <User className="h-3.5 w-3.5" />
                    Full name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: "" })); }}
                    placeholder="Your name"
                    className={`w-full rounded-xl border px-4 py-3 text-[14px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-all ${errors.name ? "border-red-400 focus:ring-red-200" : "border-gray-200 focus:border-brand-orange focus:ring-brand-orange/20"}`}
                  />
                  {errors.name && <p className="mt-1 text-[12px] text-red-500">{errors.name}</p>}
                </div>

                {/* Phone */}
                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wide text-gray-500">
                    <Phone className="h-3.5 w-3.5" />
                    Mobile number *
                  </label>
                  <div className="flex">
                    <span className="flex items-center rounded-l-xl border border-r-0 border-gray-200 bg-gray-50 px-3 text-[14px] font-semibold text-gray-500">
                      +91
                    </span>
                    <input
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      value={phone}
                      onChange={(e) => { setPhone(e.target.value.replace(/\D/g, "")); setErrors((p) => ({ ...p, phone: "" })); }}
                      placeholder="10-digit number"
                      className={`flex-1 rounded-r-xl border px-4 py-3 text-[14px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-all ${errors.phone ? "border-red-400 focus:ring-red-200" : "border-gray-200 focus:border-brand-orange focus:ring-brand-orange/20"}`}
                    />
                  </div>
                  {errors.phone && <p className="mt-1 text-[12px] text-red-500">{errors.phone}</p>}
                </div>

                {/* Saved address picker */}
                {saved.length > 0 && (
                  <div>
                    <p className="mb-1.5 text-[12px] font-bold uppercase tracking-wide text-gray-500">
                      Saved addresses
                    </p>
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {saved.map((a) => {
                        const active = address === a.address;
                        return (
                          <button
                            key={a.id}
                            type="button"
                            onClick={() => applySavedAddress(a)}
                            className={`shrink-0 rounded-xl border px-3 py-2 text-left text-[12px] transition-all ${active ? "border-brand-orange bg-brand-orange/[0.04]" : "border-gray-200 hover:border-gray-300"}`}
                          >
                            {a.label && <span className="block font-bold text-gray-900">{a.label}</span>}
                            <span className="block max-w-[180px] truncate text-gray-500">{a.address}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Address */}
                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wide text-gray-500">
                    <MapPin className="h-3.5 w-3.5" />
                    Delivery address *
                  </label>
                  <textarea
                    rows={3}
                    value={address}
                    onChange={(e) => { setAddress(e.target.value); setErrors((p) => ({ ...p, address: "" })); }}
                    placeholder="House / flat no., street, area, Deoghar"
                    className={`w-full resize-none rounded-xl border px-4 py-3 text-[14px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-all ${errors.address ? "border-red-400 focus:ring-red-200" : "border-gray-200 focus:border-brand-orange focus:ring-brand-orange/20"}`}
                  />
                  {errors.address && <p className="mt-1 text-[12px] text-red-500">{errors.address}</p>}
                </div>

                {/* Landmark */}
                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wide text-gray-500">
                    <Landmark className="h-3.5 w-3.5" />
                    Landmark (optional)
                  </label>
                  <input
                    type="text"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    placeholder="Near temple, school, etc."
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-[14px] text-gray-900 placeholder:text-gray-400 focus:border-brand-orange focus:outline-none focus:ring-2 focus:ring-brand-orange/20 transition-all"
                  />
                </div>

                {/* Save address */}
                <label className="flex cursor-pointer items-center gap-2.5 pt-1">
                  <input
                    type="checkbox"
                    checked={saveAddress}
                    onChange={(e) => setSaveAddress(e.target.checked)}
                    className="h-4 w-4 accent-brand-orange"
                  />
                  <span className="text-[13px] font-medium text-gray-600">
                    Save this address for next time
                  </span>
                </label>
              </div>
            </div>

            {/* Payment method */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-brand-orange" />
                <h2 className="text-[15px] font-bold text-gray-900">Payment method</h2>
              </div>

              <div className="space-y-2.5">
                {/* COD */}
                <label
                  className={`flex cursor-pointer items-center gap-4 rounded-2xl border-2 p-4 transition-all ${payment === "cod" ? "border-brand-orange bg-brand-orange/[0.04]" : "border-gray-100 hover:border-gray-200"}`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={payment === "cod"}
                    onChange={() => setPayment("cod")}
                    className="accent-brand-orange"
                  />
                  <div className="flex flex-1 items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 text-xl">
                      💵
                    </span>
                    <div>
                      <p className="text-[14px] font-bold text-gray-900">Cash on Delivery</p>
                      <p className="text-[12px] text-gray-500">Pay with cash when your order arrives</p>
                    </div>
                  </div>
                  {payment === "cod" && (
                    <span className="text-[11px] font-bold text-brand-orange">Selected</span>
                  )}
                </label>

                {/* Online (disabled) */}
                <div className="flex cursor-not-allowed items-center gap-4 rounded-2xl border-2 border-gray-100 p-4 opacity-50">
                  <input type="radio" disabled className="accent-brand-orange" />
                  <div className="flex flex-1 items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 text-xl">
                      📱
                    </span>
                    <div>
                      <p className="text-[14px] font-bold text-gray-900">UPI / Card / Netbanking</p>
                      <p className="text-[12px] text-gray-500">🔒 Coming soon — Razorpay integration in progress</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: order summary */}
          <div className="h-fit space-y-4 lg:sticky lg:top-24">
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-[13px] font-bold uppercase tracking-wide text-gray-400">
                Order summary
              </h2>

              {/* Items */}
              <ul className="mb-4 space-y-2.5">
                {lines.map((l) => (
                  <li key={l.itemId} className="flex items-center justify-between gap-3">
                    <span className="flex min-w-0 items-center gap-2">
                      <span className="text-xl">{l.emoji}</span>
                      <span className="truncate text-[13px] font-medium text-gray-800">
                        {l.name}
                        <span className="ml-1 text-gray-400">×{l.qty}</span>
                      </span>
                    </span>
                    <span className="shrink-0 text-[13px] font-semibold text-gray-900">
                      {formatInr(l.unitPrice * l.qty)}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="space-y-2 border-t border-gray-100 pt-3">
                <div className="flex justify-between text-[13px] text-gray-500">
                  <span>Item total</span><span>{formatInr(subtotal)}</span>
                </div>
                <div className="flex justify-between text-[13px] text-gray-500">
                  <span>Delivery</span>
                  <span className={deliveryFee === 0 ? "font-semibold text-green-600" : ""}>
                    {deliveryFee === 0 ? "FREE" : formatInr(deliveryFee)}
                  </span>
                </div>
                <div className="flex justify-between text-[13px] text-gray-500">
                  <span>Taxes (est.)</span><span>{formatInr(gst)}</span>
                </div>
                <div className="flex justify-between pt-2 text-[16px] font-extrabold text-gray-900">
                  <span>Total</span>
                  <span className="text-brand-orange">{formatInr(grand)}</span>
                </div>
              </div>
            </div>

            {/* Delivery estimate */}
            <div className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
              <Bike className="h-5 w-5 shrink-0 text-brand-orange" />
              <div>
                <p className="text-[13px] font-bold text-gray-900">Estimated delivery</p>
                <p className="text-[12px] text-gray-500">30 – 45 minutes</p>
              </div>
            </div>

            {errors.submit && (
              <p className="text-center text-[12px] text-red-500">{errors.submit}</p>
            )}

            {/* Place order */}
            <motion.button
              type="button"
              onClick={placeOrder}
              disabled={placing}
              whileTap={{ scale: 0.98 }}
              className="flex w-full items-center justify-between rounded-2xl bg-brand-orange px-5 py-4 shadow-[0_8px_24px_rgba(232,93,4,0.35)] transition-all hover:bg-brand-orange-dark disabled:opacity-60"
            >
              <div>
                <p className="text-left text-[15px] font-extrabold text-white">
                  {placing ? "Placing order…" : "Place order"}
                </p>
                <p className="text-left text-[11px] text-white/70">
                  {payment === "cod" ? "Pay on delivery" : "Pay online"}
                </p>
              </div>
              <span className="text-[16px] font-extrabold text-white">{formatInr(grand)}</span>
            </motion.button>
          </div>
        </div>
      </main>
    </>
  );
}
