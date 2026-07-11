import { NextResponse } from "next/server";
import { isAdminSession } from "@/lib/auth/admin-session";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const supabase = getSupabaseAdminClient();

  const { error } = await supabase
    .from("coupons")
    .update({ is_active: body.isActive === true })
    .eq("id", id);

  if (error) return NextResponse.json({ error: "Could not update coupon." }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const supabase = getSupabaseAdminClient();

  const { error } = await supabase.from("coupons").delete().eq("id", id);
  if (error) return NextResponse.json({ error: "Could not delete coupon." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
