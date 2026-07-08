import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ orders: [] });

  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("orders")
    .select("id, order_number, items, status, payment_mode, payment_status, grand_total, created_at")
    .eq("customer_id", session.customerId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Could not fetch orders." }, { status: 500 });
  }
  return NextResponse.json({ orders: data });
}
