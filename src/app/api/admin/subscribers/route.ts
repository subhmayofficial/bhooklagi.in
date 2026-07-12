import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { isAdminSession } from "@/lib/auth/admin-session";

type PushSubRow = {
  id: string;
  endpoint: string;
  customer_id?: string | null;
  created_at: string;
};

function isMissingPushTableError(error: { code?: string; message?: string } | null) {
  return error?.code === "42P01" || /push_subscriptions/i.test(error?.message ?? "") && /does not exist/i.test(error?.message ?? "");
}

function isMissingCustomerIdError(error: { code?: string; message?: string } | null) {
  return error?.code === "42703" || /customer_id/i.test(error?.message ?? "") && /does not exist/i.test(error?.message ?? "");
}

export async function GET() {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseAdminClient();
  let setupWarning: string | null = null;

  // Push subscribers
  let { data: pushSubs, error: pushError } = await supabase
    .from("push_subscriptions")
    .select("id, endpoint, customer_id, created_at")
    .order("created_at", { ascending: false });

  if (pushError) {
    if (isMissingCustomerIdError(pushError)) {
      setupWarning = "Push subscriptions table is missing customer_id. Run the latest Supabase migration for single-user targeting.";
      const fallback = await supabase
        .from("push_subscriptions")
        .select("id, endpoint, created_at")
        .order("created_at", { ascending: false });
      pushSubs = (fallback.data ?? []).map((row) => ({ ...row, customer_id: null }));
      pushError = fallback.error;
    }

    if (pushError) {
      if (isMissingPushTableError(pushError)) {
        setupWarning = "Push subscriptions table is not created yet. Run the push_subscriptions Supabase migration.";
        pushSubs = [];
      } else {
        console.error("Error fetching push subscriptions:", pushError);
        return NextResponse.json({ error: pushError.message || "Failed to fetch push subscriptions." }, { status: 500 });
      }
    }
  }

  // Enrich with customer info
  const pushRows = (pushSubs ?? []) as PushSubRow[];
  const customerIds = [...new Set(pushRows.map((s) => s.customer_id).filter(Boolean))];
  const customerMap: Record<string, { name: string | null; phone: string }> = {};
  if (customerIds.length > 0) {
    const { data: customers } = await supabase
      .from("customers")
      .select("id, name, phone")
      .in("id", customerIds);
    for (const c of customers ?? []) {
      customerMap[c.id as string] = { name: c.name as string | null, phone: c.phone as string };
    }
  }

  const subscribers = pushRows.map((s) => ({
    id: s.id as string,
    endpoint: s.endpoint as string,
    customerId: (s.customer_id as string | null) ?? null,
    name: s.customer_id ? (customerMap[s.customer_id as string]?.name ?? null) : null,
    phone: s.customer_id ? (customerMap[s.customer_id as string]?.phone ?? null) : null,
    createdAt: s.created_at as string,
  }));

  const deviceStats = new Map<string, { deviceCount: number; latestAt: string | null }>();
  for (const row of pushRows) {
    if (!row.customer_id) continue;
    const previous = deviceStats.get(row.customer_id) ?? { deviceCount: 0, latestAt: null };
    previous.deviceCount += 1;
    if (!previous.latestAt || new Date(row.created_at).getTime() > new Date(previous.latestAt).getTime()) {
      previous.latestAt = row.created_at;
    }
    deviceStats.set(row.customer_id, previous);
  }

  const { data: allCustomers, error: customersError } = await supabase
    .from("customers")
    .select("id, name, phone, created_at")
    .order("created_at", { ascending: false });

  const users = customersError
    ? []
    : (allCustomers ?? []).map((customer) => {
        const stat = deviceStats.get(customer.id as string) ?? { deviceCount: 0, latestAt: null };
        return {
          id: customer.id as string,
          name: customer.name as string | null,
          phone: customer.phone as string,
          createdAt: customer.created_at as string,
          deviceCount: stat.deviceCount,
          latestSubscriptionAt: stat.latestAt,
        };
      });

  // Kitchen notification subscribers (for WhatsApp list)
  const { data: kitchenSubs } = await supabase
    .from("kitchen_notifications")
    .select("id, phone, name, created_at")
    .order("created_at", { ascending: false });

  return NextResponse.json({ subscribers, users, kitchenSubs: kitchenSubs ?? [], setupWarning });
}
