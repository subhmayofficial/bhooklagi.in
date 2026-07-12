import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { isAdminSession } from "@/lib/auth/admin-session";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { computeDynamicEta } from "@/lib/orders";
import { estimateDeliveryMinutes } from "@/lib/location";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ orderNumber: string }> },
) {
  const { orderNumber } = await params;
  const supabase = getSupabaseAdminClient();

  const { data: order, error } = await supabase
    .from("orders")
    .select(
      "id, order_number, customer_id, items, status, payment_mode, payment_status, delivery_name, delivery_phone, delivery_address, delivery_landmark, delivery_lat, delivery_lng, delivery_accuracy_m, delivery_location_source, delivery_location_captured_at, subtotal, delivery_fee, gst, grand_total, created_at, food_rating, delivery_rating, rating_comment, rated_at",
    )
    .eq("order_number", orderNumber)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: "Could not fetch order." }, { status: 500 });
  }
  if (!order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  // Only the owner (or an admin) may view an order.
  const session = await getSession();
  const admin = await isAdminSession();
  if (!admin && (!session || session.customerId !== order.customer_id)) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const { data: events } = await supabase
    .from("order_events")
    .select("status, note, created_at")
    .eq("order_id", order.id)
    .order("created_at", { ascending: true });

  const customerCoords =
    order.delivery_lat !== null && order.delivery_lng !== null
      ? { lat: order.delivery_lat, lng: order.delivery_lng }
      : null;
  const baseEta = estimateDeliveryMinutes(customerCoords);
  const dynamicEta = computeDynamicEta(
    order.status,
    order.created_at,
    events ?? [],
    baseEta.max
  );

  return NextResponse.json({
    order: {
      id: order.id,
      orderNumber: order.order_number,
      items: order.items,
      status: order.status,
      paymentMode: order.payment_mode,
      paymentStatus: order.payment_status,
      deliveryName: order.delivery_name,
      deliveryPhone: order.delivery_phone,
      deliveryAddress: order.delivery_address,
      deliveryLandmark: order.delivery_landmark,
      deliveryLat: order.delivery_lat,
      deliveryLng: order.delivery_lng,
      deliveryAccuracyM: order.delivery_accuracy_m,
      deliveryLocationSource: order.delivery_location_source,
      deliveryLocationCapturedAt: order.delivery_location_captured_at,
      subtotal: order.subtotal,
      deliveryFee: order.delivery_fee,
      gst: order.gst,
      grandTotal: order.grand_total,
      createdAt: order.created_at,
      foodRating: order.food_rating ?? null,
      deliveryRating: order.delivery_rating ?? null,
      ratingComment: order.rating_comment ?? null,
      ratedAt: order.rated_at ?? null,
    },
    events: events ?? [],
    dynamicEta,
  });
}
