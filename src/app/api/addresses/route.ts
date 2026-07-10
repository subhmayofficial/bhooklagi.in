import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

function parseLocation(value: unknown) {
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

  return { lat, lng, accuracyM, capturedAt };
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ addresses: [] });

  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("saved_addresses")
    .select("id, label, address, landmark, lat, lng, accuracy_m, location_captured_at, is_default, created_at")
    .eq("customer_id", session.customerId)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Could not fetch addresses." }, { status: 500 });
  }

  const addresses = (data ?? []).map((a) => ({
    id: a.id as string,
    label: a.label as string | null,
    address: a.address as string,
    landmark: a.landmark as string | null,
    lat: a.lat as number | null,
    lng: a.lng as number | null,
    accuracyM: a.accuracy_m as number | null,
    locationCapturedAt: a.location_captured_at as string | null,
    isDefault: a.is_default as boolean,
  }));

  return NextResponse.json({ addresses });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Please log in." }, { status: 401 });

  const body = await req.json().catch(() => null);
  const address = typeof body?.address === "string" ? body.address.trim() : "";
  const label = typeof body?.label === "string" ? body.label.trim() : "";
  const landmark = typeof body?.landmark === "string" ? body.landmark.trim() : "";
  const location = parseLocation(body?.location);

  if (!address) {
    return NextResponse.json({ error: "Address is required." }, { status: 400 });
  }

  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("saved_addresses")
    .insert({
      customer_id: session.customerId,
      address,
      label: label || null,
      landmark: landmark || null,
      lat: location?.lat ?? null,
      lng: location?.lng ?? null,
      accuracy_m: location?.accuracyM ?? null,
      location_source: location ? "browser_gps" : null,
      location_captured_at: location?.capturedAt ?? null,
    })
    .select("id")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Could not save address." }, { status: 500 });
  }
  return NextResponse.json({ ok: true, id: data.id });
}
