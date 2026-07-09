import { NextResponse } from "next/server";
import { isAdminSession } from "@/lib/auth/admin-session";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseAdminClient();

  const { data: customers, error: customersError } = await supabase
    .from("customers")
    .select("id, phone, name, wallet_balance, created_at, last_login_at")
    .order("created_at", { ascending: false });

  if (customersError) {
    return NextResponse.json({ error: "Could not fetch users." }, { status: 500 });
  }

  const { data: orders, error: ordersError } = await supabase
    .from("orders")
    .select("customer_id, grand_total")
    .not("customer_id", "is", null);

  if (ordersError) {
    return NextResponse.json({ error: "Could not fetch orders." }, { status: 500 });
  }

  const statsByCustomer = new Map<string, { orderCount: number; totalSpent: number }>();
  for (const o of orders ?? []) {
    const customerId = o.customer_id as string;
    const stat = statsByCustomer.get(customerId) ?? { orderCount: 0, totalSpent: 0 };
    stat.orderCount += 1;
    stat.totalSpent += o.grand_total as number;
    statsByCustomer.set(customerId, stat);
  }

  const users = (customers ?? []).map((c) => ({
    id: c.id as string,
    phone: c.phone as string,
    name: c.name as string | null,
    walletBalance: c.wallet_balance as number,
    createdAt: c.created_at as string,
    lastLoginAt: c.last_login_at as string,
    orderCount: statsByCustomer.get(c.id as string)?.orderCount ?? 0,
    totalSpent: statsByCustomer.get(c.id as string)?.totalSpent ?? 0,
  }));

  return NextResponse.json({ users });
}
