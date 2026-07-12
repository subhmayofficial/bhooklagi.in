import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { getSession } from "@/lib/auth/session";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ orderNumber: string }> },
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized. Please log in to pay." }, { status: 401 });
  }

  const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    return NextResponse.json(
      { error: "Payment gateway configuration error on server." },
      { status: 500 },
    );
  }

  const { orderNumber } = await params;
  const supabase = getSupabaseAdminClient();
  const { data: order, error } = await supabase
    .from("orders")
    .select("id, order_number, customer_id, status, payment_status, grand_total")
    .eq("order_number", orderNumber)
    .eq("customer_id", session.customerId)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: "Could not fetch order." }, { status: 500 });
  }
  if (!order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }
  if (order.status === "cancelled") {
    return NextResponse.json({ error: "Cancelled orders cannot be paid online." }, { status: 400 });
  }
  if (order.payment_status === "paid") {
    return NextResponse.json({ error: "This order is already paid." }, { status: 400 });
  }

  const amount = Math.round(Number(order.grand_total) * 100);
  if (amount < 100) {
    return NextResponse.json(
      { error: "Minimum order amount for online payment is ₹1 (100 paise)." },
      { status: 400 },
    );
  }

  try {
    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const paymentOrder = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: `pay_${order.order_number}_${Date.now()}`.slice(0, 40),
      notes: {
        localOrderId: order.id,
        orderNumber: order.order_number,
      },
    });

    return NextResponse.json({
      order_id: paymentOrder.id,
      amount: paymentOrder.amount,
      currency: paymentOrder.currency,
      keyId,
      localOrderId: order.id,
    });
  } catch (err: unknown) {
    console.error("Existing order Razorpay creation error:", err);
    return NextResponse.json(
      { error: "Failed to initialize payment order with Razorpay." },
      { status: 500 },
    );
  }
}
