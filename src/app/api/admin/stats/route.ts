import { NextRequest, NextResponse } from "next/server";
import { isAdminSession } from "@/lib/auth/admin-session";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/orders";

type OrderItem = {
  name?: string;
  qty?: number;
  unitPrice?: number;
};

const IST_OFFSET_MINUTES = 330;
const MAX_RANGE_DAYS = 366;

function istDateKey(date: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function parseDateKey(value: string | null) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;
  return { year, month, day, key: value };
}

function startOfIstDayUtc(key: string) {
  const parsed = parseDateKey(key);
  if (!parsed) return null;
  return new Date(Date.UTC(parsed.year, parsed.month - 1, parsed.day) - IST_OFFSET_MINUTES * 60_000);
}

function addDaysKey(key: string, days: number) {
  const start = startOfIstDayUtc(key);
  if (!start) return null;
  const shifted = new Date(start.getTime() + days * 86_400_000);
  return istDateKey(shifted);
}

function dateRangeFromRequest(req: NextRequest) {
  const todayKey = istDateKey(new Date());
  const fallbackFrom = addDaysKey(todayKey, -6) ?? todayKey;
  const rawFrom = parseDateKey(req.nextUrl.searchParams.get("from"))?.key ?? fallbackFrom;
  const rawTo = parseDateKey(req.nextUrl.searchParams.get("to"))?.key ?? todayKey;

  let fromKey = rawFrom;
  let toKey = rawTo;
  if (fromKey > toKey) {
    [fromKey, toKey] = [toKey, fromKey];
  }

  const fromUtc = startOfIstDayUtc(fromKey) ?? startOfIstDayUtc(fallbackFrom)!;
  const toStartUtc = startOfIstDayUtc(toKey) ?? startOfIstDayUtc(todayKey)!;
  let toExclusiveUtc = new Date(toStartUtc.getTime() + 86_400_000);

  const days = Math.ceil((toExclusiveUtc.getTime() - fromUtc.getTime()) / 86_400_000);
  if (days > MAX_RANGE_DAYS) {
    toExclusiveUtc = new Date(fromUtc.getTime() + MAX_RANGE_DAYS * 86_400_000);
    toKey = istDateKey(new Date(toExclusiveUtc.getTime() - 1));
  }

  return { fromKey, toKey, fromUtc, toExclusiveUtc };
}

function buildDailyBuckets(fromKey: string, toKey: string) {
  const buckets: Record<string, { date: string; orders: number; revenue: number }> = {};
  let cursor = fromKey;
  while (cursor <= toKey) {
    buckets[cursor] = { date: cursor, orders: 0, revenue: 0 };
    const next = addDaysKey(cursor, 1);
    if (!next || next <= cursor) break;
    cursor = next;
  }
  return buckets;
}

export async function GET(req: NextRequest) {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { fromKey, toKey, fromUtc, toExclusiveUtc } = dateRangeFromRequest(req);
  const todayKey = istDateKey(new Date());
  const todayStartUtc = startOfIstDayUtc(todayKey)!;
  const tomorrowStartUtc = new Date(todayStartUtc.getTime() + 86_400_000);
  const supabase = getSupabaseAdminClient();

  const [
    customersResult,
    ordersResult,
    recentOrdersResult,
  ] = await Promise.all([
    supabase
      .from("customers")
      .select("id, created_at, last_login_at"),
    supabase
      .from("orders")
      .select("id, order_number, customer_id, items, status, payment_mode, payment_status, grand_total, created_at, food_rating, delivery_rating")
      .gte("created_at", fromUtc.toISOString())
      .lt("created_at", toExclusiveUtc.toISOString())
      .order("created_at", { ascending: false }),
    supabase
      .from("orders")
      .select("id, order_number, status, payment_mode, grand_total, delivery_name, created_at")
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  if (customersResult.error) {
    return NextResponse.json({ error: "Could not fetch customer stats." }, { status: 500 });
  }
  if (ordersResult.error || recentOrdersResult.error) {
    return NextResponse.json({ error: "Could not fetch sales stats." }, { status: 500 });
  }

  const customers = customersResult.data ?? [];
  const orders = ordersResult.data ?? [];
  const dailyBuckets = buildDailyBuckets(fromKey, toKey);
  const statusCounts = Object.fromEntries(ORDER_STATUSES.map((status) => [status, 0])) as Record<OrderStatus, number>;
  const paymentModeCounts: Record<string, { orders: number; revenue: number }> = {};
  const topItems = new Map<string, { name: string; qty: number; revenue: number }>();

  let revenue = 0;
  let deliveredRevenue = 0;
  let deliveredOrders = 0;
  let cancelledOrders = 0;
  let paidOrders = 0;
  let guestOrders = 0;
  let foodRatingTotal = 0;
  let deliveryRatingTotal = 0;
  let foodRatingCount = 0;
  let deliveryRatingCount = 0;

  for (const order of orders) {
    const amount = Number(order.grand_total ?? 0);
    const status = order.status as OrderStatus;
    const dayKey = istDateKey(new Date(order.created_at as string));
    const paymentMode = String(order.payment_mode ?? "unknown");

    revenue += amount;
    if (status in statusCounts) statusCounts[status] += 1;
    if (status === "delivered") {
      deliveredOrders += 1;
      deliveredRevenue += amount;
    }
    if (status === "cancelled") cancelledOrders += 1;
    if (order.payment_status === "paid") paidOrders += 1;
    if (!order.customer_id) guestOrders += 1;

    if (dailyBuckets[dayKey]) {
      dailyBuckets[dayKey].orders += 1;
      dailyBuckets[dayKey].revenue += amount;
    }

    const payment = paymentModeCounts[paymentMode] ?? { orders: 0, revenue: 0 };
    payment.orders += 1;
    payment.revenue += amount;
    paymentModeCounts[paymentMode] = payment;

    const items = Array.isArray(order.items) ? (order.items as OrderItem[]) : [];
    for (const item of items) {
      const name = item.name ?? "Unknown item";
      const qty = Number(item.qty ?? 0);
      const unitPrice = Number(item.unitPrice ?? 0);
      const existing = topItems.get(name) ?? { name, qty: 0, revenue: 0 };
      existing.qty += qty;
      existing.revenue += qty * unitPrice;
      topItems.set(name, existing);
    }

    if (typeof order.food_rating === "number") {
      foodRatingTotal += order.food_rating;
      foodRatingCount += 1;
    }
    if (typeof order.delivery_rating === "number") {
      deliveryRatingTotal += order.delivery_rating;
      deliveryRatingCount += 1;
    }
  }

  let registeredToday = 0;
  let activeToday = 0;
  let registeredInRange = 0;
  let activeInRange = 0;

  for (const customer of customers) {
    const createdAt = new Date(customer.created_at as string);
    const lastLoginAt = new Date(customer.last_login_at as string);
    if (createdAt >= todayStartUtc && createdAt < tomorrowStartUtc) registeredToday += 1;
    if (lastLoginAt >= todayStartUtc && lastLoginAt < tomorrowStartUtc) activeToday += 1;
    if (createdAt >= fromUtc && createdAt < toExclusiveUtc) registeredInRange += 1;
    if (lastLoginAt >= fromUtc && lastLoginAt < toExclusiveUtc) activeInRange += 1;
  }

  const stats = {
    range: { from: fromKey, to: toKey },
    sales: {
      revenue,
      orders: orders.length,
      deliveredRevenue,
      deliveredOrders,
      cancelledOrders,
      paidOrders,
      guestOrders,
      averageOrderValue: orders.length ? Math.round(revenue / orders.length) : 0,
      conversionDeliveredPct: orders.length ? Math.round((deliveredOrders / orders.length) * 100) : 0,
      cancellationPct: orders.length ? Math.round((cancelledOrders / orders.length) * 100) : 0,
    },
    users: {
      total: customers.length,
      registeredToday,
      activeToday,
      registeredInRange,
      activeInRange,
      repeatCustomersInRange: new Set(orders.map((order) => order.customer_id).filter(Boolean)).size,
    },
    statusCounts,
    paymentModeCounts,
    dailySales: Object.values(dailyBuckets),
    topItems: Array.from(topItems.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 6),
    ratings: {
      food: foodRatingCount ? Number((foodRatingTotal / foodRatingCount).toFixed(1)) : null,
      delivery: deliveryRatingCount ? Number((deliveryRatingTotal / deliveryRatingCount).toFixed(1)) : null,
    },
    recentOrders: (recentOrdersResult.data ?? []).map((order) => ({
      id: order.id as string,
      orderNumber: order.order_number as string,
      status: order.status as string,
      paymentMode: order.payment_mode as string,
      deliveryName: order.delivery_name as string,
      grandTotal: order.grand_total as number,
      createdAt: order.created_at as string,
    })),
  };

  return NextResponse.json({ stats });
}
