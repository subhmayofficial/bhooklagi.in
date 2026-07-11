import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ orderNumber: string }> },
) {
  const { orderNumber } = await params;
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Login required." }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { foodRating, deliveryRating, comment } = body as {
    foodRating?: unknown;
    deliveryRating?: unknown;
    comment?: unknown;
  };

  if (!Number.isInteger(foodRating) || (foodRating as number) < 1 || (foodRating as number) > 5) {
    return NextResponse.json({ error: "Food rating must be 1–5." }, { status: 400 });
  }
  if (!Number.isInteger(deliveryRating) || (deliveryRating as number) < 1 || (deliveryRating as number) > 5) {
    return NextResponse.json({ error: "Delivery rating must be 1–5." }, { status: 400 });
  }

  const supabase = getSupabaseAdminClient();
  const { data: order, error: fetchErr } = await supabase
    .from("orders")
    .select("id, customer_id, status, rated_at")
    .eq("order_number", orderNumber)
    .maybeSingle();

  if (fetchErr || !order) return NextResponse.json({ error: "Order not found." }, { status: 404 });
  if (order.customer_id !== session.customerId) return NextResponse.json({ error: "Not found." }, { status: 404 });
  if (order.status !== "delivered") return NextResponse.json({ error: "Only delivered orders can be rated." }, { status: 400 });
  if (order.rated_at) return NextResponse.json({ error: "Already rated." }, { status: 409 });

  const { error: updateErr } = await supabase
    .from("orders")
    .update({
      food_rating: foodRating as number,
      delivery_rating: deliveryRating as number,
      rating_comment: typeof comment === "string" ? comment.trim() || null : null,
      rated_at: new Date().toISOString(),
    })
    .eq("id", order.id);

  if (updateErr) return NextResponse.json({ error: "Could not save rating." }, { status: 500 });

  return NextResponse.json({ ok: true });
}
