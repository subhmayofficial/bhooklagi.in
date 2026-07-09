import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ addresses: [] });

  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("saved_addresses")
    .select("id, label, address, landmark, is_default, created_at")
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
    })
    .select("id")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Could not save address." }, { status: 500 });
  }
  return NextResponse.json({ ok: true, id: data.id });
}
