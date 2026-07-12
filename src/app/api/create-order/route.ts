import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { getSession } from "@/lib/auth/session";
import { computeFinalServerTotals } from "@/lib/pricing";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized. Please log in to proceed." }, { status: 401 });
  }

  const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    return NextResponse.json(
      { error: "Payment gateway configuration error on server." },
      { status: 500 }
    );
  }

  const body = await req.json().catch(() => null);
  const lines = body?.lines;
  const rawCouponCode = typeof body?.couponCode === "string" ? body.couponCode.trim().toUpperCase() : "";
  const paymentMode = typeof body?.paymentMode === "string" ? body.paymentMode : "online";
  const currency = typeof body?.currency === "string" ? body.currency.toUpperCase() : "INR";
  const receipt = typeof body?.receipt === "string" && body.receipt.trim()
    ? body.receipt.trim()
    : `rcpt_${session.customerId.slice(0, 8)}_${Date.now()}`;

  if (!lines || !Array.isArray(lines) || lines.length === 0) {
    return NextResponse.json({ error: "Cart is empty or invalid." }, { status: 400 });
  }

  const supabase = getSupabaseAdminClient();
  let finalGrandTotal = 0;

  try {
    const result = await computeFinalServerTotals(lines, rawCouponCode, paymentMode, supabase);
    finalGrandTotal = result.finalGrandTotal;
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Invalid order items." }, { status: 400 });
  }

  const amount = Math.round(finalGrandTotal * 100);

  // Validate minimum amount >= 100 paise (₹1)
  if (amount < 100) {
    return NextResponse.json(
      { error: "Minimum order amount for online payment is ₹1 (100 paise)." },
      { status: 400 }
    );
  }

  try {
    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const order = await razorpay.orders.create({
      amount,
      currency,
      receipt,
    });

    return NextResponse.json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error: unknown) {
    console.error("Razorpay order creation error:", error);
    return NextResponse.json(
      { error: "Failed to initialize payment order with Razorpay." },
      { status: 500 }
    );
  }
}
