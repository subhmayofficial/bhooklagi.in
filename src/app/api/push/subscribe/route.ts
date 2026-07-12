import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSession } from "@/lib/auth/session";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const subscription = body?.subscription;

    if (!subscription || !subscription.endpoint) {
      return NextResponse.json({ error: "Invalid subscription details." }, { status: 400 });
    }

    const session = await getSession();
    const customerId = session?.customerId ?? null;

    const supabase = getSupabaseAdminClient();

    const { error } = await supabase
      .from("push_subscriptions")
      .upsert(
        { endpoint: subscription.endpoint, subscription, customer_id: customerId },
        { onConflict: "endpoint" }
      );

    if (error) {
      console.error("Error saving push subscription:", error);
      return NextResponse.json({ error: "Failed to save subscription." }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error processing push subscription:", err);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
