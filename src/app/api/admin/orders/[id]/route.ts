import { NextRequest, NextResponse } from "next/server";
import { isAdminSession } from "@/lib/auth/admin-session";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { isOrderStatus } from "@/lib/orders";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const status = body?.status;

  if (!isOrderStatus(status)) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }

  const supabase = getSupabaseAdminClient();

  // When an order is delivered and paid by COD, mark payment as collected.
  const patch: Record<string, unknown> = { status, updated_at: new Date().toISOString() };
  if (status === "delivered") patch.payment_status = "paid";

  const { error } = await supabase.from("orders").update(patch).eq("id", id);
  if (error) {
    return NextResponse.json({ error: "Could not update order." }, { status: 500 });
  }

  // Append to the status timeline (best-effort).
  await supabase.from("order_events").insert({ order_id: id, status });

  return NextResponse.json({ ok: true, status });
}
