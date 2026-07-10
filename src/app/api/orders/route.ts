import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSession } from "@/lib/auth/session";
import { computeOrderTotals } from "@/lib/pricing";
import type { CartLine } from "@/stores/cart-store";

const PHONE_RE = /^[6-9]\d{9}$/;
const MAX_LOCATION_ACCURACY_M = 250;

type DeliveryLocation = {
  lat: number;
  lng: number;
  accuracyM: number | null;
  source: string;
  capturedAt: string;
};

function generateOrderNumber(): string {
  const t = Date.now().toString(36).toUpperCase();
  const r = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `BL-${t}-${r}`;
}

function isValidLines(value: unknown): value is CartLine[] {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every(
      (l) =>
        l &&
        typeof l.itemId === "string" &&
        typeof l.name === "string" &&
        typeof l.unitPrice === "number" &&
        typeof l.qty === "number" &&
        l.qty > 0,
    )
  );
}

function parseDeliveryLocation(value: unknown): DeliveryLocation | null {
  if (!value || typeof value !== "object") return null;
  const location = value as Record<string, unknown>;
  const lat = typeof location.lat === "number" ? location.lat : Number(location.lat);
  const lng = typeof location.lng === "number" ? location.lng : Number(location.lng);
  const accuracyM =
    location.accuracyM === null || location.accuracyM === undefined
      ? null
      : typeof location.accuracyM === "number"
        ? location.accuracyM
        : Number(location.accuracyM);
  const capturedAt = typeof location.capturedAt === "string" ? location.capturedAt : new Date().toISOString();

  if (!Number.isFinite(lat) || lat < -90 || lat > 90) return null;
  if (!Number.isFinite(lng) || lng < -180 || lng > 180) return null;
  if (accuracyM !== null && (!Number.isFinite(accuracyM) || accuracyM < 0)) return null;
  if (Number.isNaN(Date.parse(capturedAt))) return null;

  return {
    lat,
    lng,
    accuracyM,
    source: "browser_gps",
    capturedAt,
  };
}

export async function POST(req: NextRequest) {
  // Ordering requires login so every order is tied to a customer.
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Please log in to place an order." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const lines = body?.lines;
  const delivery = body?.delivery ?? {};
  // COD-only for now; other modes are rejected until their flows exist.
  const paymentMode = "cod";
  const saveAddress = body?.saveAddress === true;

  if (!isValidLines(lines)) {
    return NextResponse.json({ error: "Cart is empty or invalid." }, { status: 400 });
  }

  const name = typeof delivery.name === "string" ? delivery.name.trim() : "";
  const phone = typeof delivery.phone === "string" ? delivery.phone.trim() : "";
  const address = typeof delivery.address === "string" ? delivery.address.trim() : "";
  const landmark = typeof delivery.landmark === "string" ? delivery.landmark.trim() : "";
  const location = parseDeliveryLocation(delivery.location);

  if (!name || !address) {
    return NextResponse.json({ error: "Missing delivery details." }, { status: 400 });
  }
  if (!PHONE_RE.test(phone)) {
    return NextResponse.json({ error: "Invalid phone number." }, { status: 400 });
  }
  if (!location) {
    return NextResponse.json({ error: "Please allow precise location before placing the order." }, { status: 400 });
  }
  if (location.accuracyM !== null && location.accuracyM > MAX_LOCATION_ACCURACY_M) {
    return NextResponse.json(
      { error: "Location is not precise enough. Please move near an open area and retry." },
      { status: 400 },
    );
  }

  const totals = computeOrderTotals(lines);
  const supabase = getSupabaseAdminClient();

  const { data: order, error } = await supabase
    .from("orders")
    .insert({
      order_number: generateOrderNumber(),
      customer_id: session.customerId,
      items: lines,
      delivery_name: name,
      delivery_phone: phone,
      delivery_address: address,
      delivery_landmark: landmark || null,
      delivery_lat: location.lat,
      delivery_lng: location.lng,
      delivery_accuracy_m: location.accuracyM,
      delivery_location_source: location.source,
      delivery_location_captured_at: location.capturedAt,
      payment_mode: paymentMode,
      subtotal: totals.subtotal,
      delivery_fee: totals.deliveryFee,
      gst: totals.gst,
      grand_total: totals.grandTotal,
    })
    .select("id, order_number, created_at")
    .single();

  if (error || !order) {
    return NextResponse.json({ error: "Could not place order. Try again." }, { status: 500 });
  }

  // Seed the status timeline. Best-effort: don't fail the order if this errors.
  await supabase.from("order_events").insert({ order_id: order.id, status: "placed" });

  if (saveAddress) {
    await supabase
      .from("saved_addresses")
      .insert({
        customer_id: session.customerId,
        address,
        landmark: landmark || null,
        lat: location.lat,
        lng: location.lng,
        accuracy_m: location.accuracyM,
        location_source: location.source,
        location_captured_at: location.capturedAt,
      });
  }

  return NextResponse.json({
    order: {
      id: order.id,
      orderNumber: order.order_number as string,
      createdAt: order.created_at as string,
      ...totals,
    },
  });
}
