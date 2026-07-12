import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

const HIDDEN_COUPON_CODES = new Set(["UPI5"]);

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

  const coupons = (data ?? []).filter((coupon) => {
    const code = String(coupon.code ?? "").toUpperCase();
    if (HIDDEN_COUPON_CODES.has(code)) return false;
    return coupon.payment_mode_required !== "upi" && coupon.payment_mode_required !== "online";
  });

  return NextResponse.json({ coupons });
}
