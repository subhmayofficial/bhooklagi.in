import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { isAdminSession } from "@/lib/auth/admin-session";
import webpush from "web-push";

const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const privateKey = process.env.VAPID_PRIVATE_KEY;

if (publicKey && privateKey) {
  webpush.setVapidDetails("mailto:support@bhooklagi.in", publicKey, privateKey);
}

type PushSubscriptionRow = {
  id: string;
  endpoint: string;
  subscription: webpush.PushSubscription;
  customer_id?: string | null;
};

function isMissingPushTableError(error: { code?: string; message?: string } | null) {
  return error?.code === "42P01" || /push_subscriptions/i.test(error?.message ?? "") && /does not exist/i.test(error?.message ?? "");
}

function isMissingCustomerIdError(error: { code?: string; message?: string } | null) {
  return error?.code === "42703" || /customer_id/i.test(error?.message ?? "") && /does not exist/i.test(error?.message ?? "");
}

export async function POST(req: NextRequest) {
  try {
    if (!(await isAdminSession())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    const title = body?.title?.trim() || "Bhook Lagi?";
    const messageBody = body?.body?.trim() || "You have a new update.";
    const icon = body?.icon || "/favicon_io/android-chrome-192x192.png";
    const url = body?.url || "/home";

    // targetType: "all" | "user" | "subscription"
    const requestedTargetType: string = body?.targetType ?? "all";
    const targetType = ["all", "user", "subscription"].includes(requestedTargetType) ? requestedTargetType : "all";
    const customerId: string | null = body?.customerId ?? null;
    const subscriptionId: string | null = body?.subscriptionId ?? null;

    if (!publicKey || !privateKey) {
      return NextResponse.json(
        { error: "VAPID keys not configured. Cannot send push notifications." },
        { status: 500 }
      );
    }

    const supabase = getSupabaseAdminClient();

    // Build query based on target
    let query = supabase.from("push_subscriptions").select("id, endpoint, subscription, customer_id");
    if (targetType === "user" && customerId) {
      query = query.eq("customer_id", customerId);
    } else if (targetType === "subscription" && subscriptionId) {
      query = query.eq("id", subscriptionId);
    }

    let { data: subscriptions, error } = await query;
    let subscriptionRows = (subscriptions ?? []) as PushSubscriptionRow[];

    if (error) {
      if (isMissingPushTableError(error)) {
        return NextResponse.json({
          success: true,
          sentCount: 0,
          failedCount: 0,
          message: "No push subscribers table found. Run the push_subscriptions Supabase migration first.",
        });
      }
      if (isMissingCustomerIdError(error)) {
        if (targetType === "user") {
          return NextResponse.json(
            { error: "Single-user push needs customer_id on push_subscriptions. Run the latest Supabase migration." },
            { status: 400 }
          );
        }

        let fallbackQuery = supabase.from("push_subscriptions").select("id, endpoint, subscription");
        if (targetType === "subscription" && subscriptionId) {
          fallbackQuery = fallbackQuery.eq("id", subscriptionId);
        }
        const fallback = await fallbackQuery;
        subscriptions = fallback.data as typeof subscriptions;
        subscriptionRows = (fallback.data ?? []) as PushSubscriptionRow[];
        error = fallback.error;
        if (error && isMissingPushTableError(error)) {
          return NextResponse.json({
            success: true,
            sentCount: 0,
            failedCount: 0,
            message: "No push subscribers table found. Run the push_subscriptions Supabase migration first.",
          });
        }
      }
    }

    if (error) {
      console.error("Error fetching subscriptions:", error);
      return NextResponse.json({ error: error.message || "Failed to fetch push subscriptions." }, { status: 500 });
    }

    subscriptionRows = (subscriptions ?? []) as PushSubscriptionRow[];

    if (subscriptionRows.length === 0) {
      return NextResponse.json({
        success: true, sentCount: 0,
        message: targetType === "all"
          ? "No push subscribers found."
          : "This user has no push subscription registered.",
      });
    }

    let successCount = 0;
    let failedCount = 0;
    const staleIds: string[] = [];

    await Promise.all(
      subscriptionRows.map(async (sub) => {
        try {
          await webpush.sendNotification(
            sub.subscription as webpush.PushSubscription,
            JSON.stringify({ title, body: messageBody, icon, url })
          );
          successCount++;
        } catch (err: unknown) {
          failedCount++;
          const statusCode = (err as { statusCode?: number }).statusCode;
          if (statusCode === 404 || statusCode === 410) {
            staleIds.push(sub.id as string);
          }
        }
      })
    );

    // Prune expired subscriptions
    if (staleIds.length > 0) {
      await supabase.from("push_subscriptions").delete().in("id", staleIds);
    }

    const targetLabel =
      targetType === "all" ? "all subscribers"
      : targetType === "user" ? "this user's devices"
      : "selected device";

    return NextResponse.json({
      success: true,
      sentCount: successCount,
      failedCount,
      message: `Sent to ${successCount} device${successCount !== 1 ? "s" : ""} (${targetLabel}).${staleIds.length > 0 ? ` Removed ${staleIds.length} stale subscription${staleIds.length !== 1 ? "s" : ""}.` : ""}`,
    });
  } catch (err) {
    console.error("Error in send-push:", err);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
