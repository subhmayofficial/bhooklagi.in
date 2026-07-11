import { NextResponse } from "next/server";
import { isAdminSession } from "@/lib/auth/admin-session";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  if (!(await isAdminSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("coupons")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: "Could not fetch coupons." }, { status: 500 });
  return NextResponse.json({ coupons: data ?? [] });
}

export async function POST(req: Request) {
  if (!(await isAdminSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { code, discountType, discountValue, minOrder, paymentModeRequired, maxUses } = body as Record<string, unknown>;

  if (!code || typeof code !== "string" || !code.trim()) {
    return NextResponse.json({ error: "Code is required." }, { status: 400 });
  }
  if (!["percent", "flat"].includes(discountType as string)) {
    return NextResponse.json({ error: "Discount type must be percent or flat." }, { status: 400 });
  }
  if (!Number.isInteger(discountValue) || (discountValue as number) < 1) {
    return NextResponse.json({ error: "Discount value must be a positive integer." }, { status: 400 });
  }
  if (discountType === "percent" && (discountValue as number) > 100) {
    return NextResponse.json({ error: "Percent discount cannot exceed 100." }, { status: 400 });
  }

  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("coupons")
    .insert({
      code: (code as string).trim().toUpperCase(),
      discount_type: discountType as string,
      discount_value: discountValue as number,
      min_order: Number.isInteger(minOrder) ? (minOrder as number) : 0,
      payment_mode_required: paymentModeRequired || null,
      max_uses: Number.isInteger(maxUses) && (maxUses as number) > 0 ? (maxUses as number) : null,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") return NextResponse.json({ error: "Coupon code already exists." }, { status: 409 });
    return NextResponse.json({ error: "Could not create coupon." }, { status: 500 });
  }

  return NextResponse.json({ coupon: data });
}
