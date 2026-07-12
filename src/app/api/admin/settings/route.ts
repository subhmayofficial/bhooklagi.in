import { NextResponse } from "next/server";
import { isAdminSession } from "@/lib/auth/admin-session";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  if (!(await isAdminSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("store_settings")
    .select("*")
    .eq("id", "default")
    .single();

  if (error || !data) {
    return NextResponse.json({
      settings: {
        delivery_charge: 49,
        free_delivery_threshold: 299,
        tax_percent: 5,
        upi_discount_enabled: false,
        upi_discount_percent: 0,
      }
    });
  }

  return NextResponse.json({ settings: data });
}

export async function PATCH(req: Request) {
  if (!(await isAdminSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { delivery_charge, free_delivery_threshold, tax_percent, upi_discount_enabled, upi_discount_percent } = body;

  const supabase = getSupabaseAdminClient();

  // Upsert the settings
  const { data, error } = await supabase
    .from("store_settings")
    .upsert({
      id: "default",
      delivery_charge: Number(delivery_charge) || 0,
      free_delivery_threshold: Number(free_delivery_threshold) || 0,
      tax_percent: Number(tax_percent) || 0,
      upi_discount_enabled: Boolean(upi_discount_enabled),
      upi_discount_percent: Number(upi_discount_percent) || 0,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ settings: data });
}
