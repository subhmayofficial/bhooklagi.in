import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ orders: [] });

  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("orders")
    .select("order_number, items, status, payment_mode, grand_total, created_at")
    .eq("customer_id", session.customerId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Could not fetch orders." }, { status: 500 });
  }

  const orders = (data ?? []).map((o) => ({
    orderNumber: o.order_number as string,
    items: o.items,
    status: o.status as string,
    paymentMode: o.payment_mode as string,
    grandTotal: o.grand_total as number,
    createdAt: o.created_at as string,
  }));

  return NextResponse.json({ orders });
}
