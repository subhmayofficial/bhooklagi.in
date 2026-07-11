import { NextRequest, NextResponse } from "next/server";
import { isAdminSession } from "@/lib/auth/admin-session";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { isOrderStatus } from "@/lib/orders";

export async function GET(req: NextRequest) {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const statusFilter = req.nextUrl.searchParams.get("status");
  const supabase = getSupabaseAdminClient();

  let query = supabase
    .from("orders")
    .select(
      "id, order_number, items, status, payment_mode, payment_status, delivery_name, delivery_phone, delivery_address, delivery_landmark, delivery_lat, delivery_lng, delivery_accuracy_m, delivery_location_source, delivery_location_captured_at, subtotal, delivery_fee, gst, grand_total, created_at, food_rating, delivery_rating, rating_comment, rated_at",
    )
    .order("created_at", { ascending: false })
    .limit(200);

  if (statusFilter && isOrderStatus(statusFilter)) {
    query = query.eq("status", statusFilter);
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: "Could not fetch orders." }, { status: 500 });
  }

  const orders = (data ?? []).map((o) => ({
    id: o.id as string,
    orderNumber: o.order_number as string,
    items: o.items,
    status: o.status as string,
    paymentMode: o.payment_mode as string,
    paymentStatus: o.payment_status as string,
    deliveryName: o.delivery_name as string,
    deliveryPhone: o.delivery_phone as string,
    deliveryAddress: o.delivery_address as string,
    deliveryLandmark: o.delivery_landmark as string | null,
    deliveryLat: o.delivery_lat as number | null,
    deliveryLng: o.delivery_lng as number | null,
    deliveryAccuracyM: o.delivery_accuracy_m as number | null,
    deliveryLocationSource: o.delivery_location_source as string | null,
    deliveryLocationCapturedAt: o.delivery_location_captured_at as string | null,
    subtotal: o.subtotal as number,
    deliveryFee: o.delivery_fee as number,
    gst: o.gst as number,
    grandTotal: o.grand_total as number,
    createdAt: o.created_at as string,
    foodRating: (o.food_rating as number | null) ?? null,
    deliveryRating: (o.delivery_rating as number | null) ?? null,
    ratingComment: (o.rating_comment as string | null) ?? null,
    ratedAt: (o.rated_at as string | null) ?? null,
  }));

  return NextResponse.json({ orders });
}
