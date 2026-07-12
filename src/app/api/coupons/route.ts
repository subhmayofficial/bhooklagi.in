import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("coupons")
    .select("code, discount_type, discount_value, min_order, payment_mode_required")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Could not fetch coupons." }, { status: 500 });
  }

  return NextResponse.json({ coupons: data ?? [] });
}
