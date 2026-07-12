import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Missing verification payload." }, { status: 400 });
  }

  // Support both razorpay_* prefix and exact field names
  const orderId = body.razorpay_order_id || body.order_id;
  const paymentId = body.razorpay_payment_id || body.payment_id;
  const signature = body.razorpay_signature || body.signature;
  const localOrderId = body.localOrderId || body.db_order_id;
  const paymentMode = typeof body.paymentMode === "string" ? body.paymentMode : null;

  if (!orderId || !paymentId || !signature) {
    return NextResponse.json(
      { error: "Missing required Razorpay payment verification fields." },
      { status: 400 }
    );
  }

  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    return NextResponse.json(
      { error: "Payment verification configuration error on server." },
      { status: 500 }
    );
  }

  // Generate HMAC-SHA256 signature
  const generatedSignature = crypto
    .createHmac("sha256", keySecret)
    .update(orderId + "|" + paymentId)
    .digest("hex");

  if (generatedSignature !== signature) {
    return NextResponse.json(
      { error: "Payment verification failed. Signature mismatch." },
      { status: 400 }
    );
  }

  // If localOrderId is passed, update order in database to paid
  if (localOrderId && typeof localOrderId === "string") {
    const supabase = getSupabaseAdminClient();
    const { error } = await supabase
      .from("orders")
      .update({
        ...(paymentMode ? { payment_mode: paymentMode } : {}),
        payment_status: "paid",
        updated_at: new Date().toISOString(),
      })
      .eq("id", localOrderId);

    if (!error) {
      await supabase.from("order_events").insert({
        order_id: localOrderId,
        status: "paid",
        note: `Online payment verified via Razorpay (ID: ${paymentId})`,
      });
    }
  }

  return NextResponse.json({
    success: true,
    message: "Payment successfully verified.",
    razorpay_payment_id: paymentId,
    razorpay_order_id: orderId,
  });
}
