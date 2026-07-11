import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const code = typeof body.code === "string" ? body.code.trim().toUpperCase() : "";
  const paymentMode = typeof body.paymentMode === "string" ? body.paymentMode : "cod";
  const subtotal = typeof body.subtotal === "number" ? body.subtotal : 0;

  if (!code) return NextResponse.json({ error: "No code provided." }, { status: 400 });

  const supabase = getSupabaseAdminClient();
  const { data: coupon } = await supabase
    .from("coupons")
    .select("id, code, discount_type, discount_value, min_order, payment_mode_required, max_uses, used_count")
    .eq("code", code)
    .eq("is_active", true)
    .maybeSingle();

  if (!coupon) return NextResponse.json({ error: "Invalid or expired coupon." }, { status: 404 });

  if (coupon.min_order > 0 && subtotal < coupon.min_order) {
    return NextResponse.json(
      { error: `Minimum order ₹${coupon.min_order} required for this coupon.` },
      { status: 400 },
    );
  }

  if (coupon.payment_mode_required && coupon.payment_mode_required !== paymentMode) {
    const label = coupon.payment_mode_required === "upi" ? "UPI" : coupon.payment_mode_required.toUpperCase();
    return NextResponse.json(
      { error: `This coupon is valid only for ${label} payments. Switch to ${label} to apply.` },
      { status: 400 },
    );
  }

  if (coupon.max_uses !== null && coupon.used_count >= coupon.max_uses) {
    return NextResponse.json({ error: "This coupon has reached its usage limit." }, { status: 400 });
  }

  const discount =
    coupon.discount_type === "percent"
      ? Math.round(subtotal * coupon.discount_value / 100)
      : coupon.discount_value;

  return NextResponse.json({
    ok: true,
    code: coupon.code,
    discount,
    discountType: coupon.discount_type as "percent" | "flat",
    discountValue: coupon.discount_value as number,
    paymentModeRequired: (coupon.payment_mode_required as string | null) ?? null,
    description:
      coupon.discount_type === "percent"
        ? `${coupon.discount_value}% off`
        : `₹${coupon.discount_value} off`,
  });
}
