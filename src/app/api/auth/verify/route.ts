import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSessionCookie } from "@/lib/auth/session";

const PHONE_RE = /^[6-9]\d{9}$/;

type Msg91VerifyResult = { ok: boolean; message?: string; code?: string };

async function verifyWithMsg91(authkey: string, accessToken: string): Promise<Msg91VerifyResult> {
  const res = await fetch("https://api.msg91.com/api/v5/widget/verifyAccessToken", {
    method: "POST",
    headers: { authkey, "content-type": "application/json" },
    body: JSON.stringify({ "access-token": accessToken }),
  });
  const data = (await res.json().catch(() => null)) as
    | { type?: string; message?: string; code?: string }
    | null;
  return {
    ok: res.ok && data?.type !== "error",
    message: data?.message,
    code: data?.code,
  };
}

/**
 * Trades a verified MSG91 OTP Widget access-token for our own session cookie.
 * The access-token is minted by MSG91 only after the user actually completed
 * OTP verification for the phone number passed to `sendOtp` client-side, so a
 * "success" from verifyAccessToken is proof of ownership of that number.
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const phone = typeof body?.phone === "string" ? body.phone.trim() : "";
  const accessToken = typeof body?.accessToken === "string" ? body.accessToken.trim() : "";
  const name = typeof body?.name === "string" ? body.name.trim() : "";

  if (!phone || !accessToken) {
    return NextResponse.json({ error: "Missing phone or accessToken." }, { status: 400 });
  }
  if (!PHONE_RE.test(phone)) {
    return NextResponse.json({ error: "Invalid phone number." }, { status: 400 });
  }

  // verifyAccessToken (under /api/v5/widget/) needs a valid MSG91 authkey. The
  // widget's own auth token (tokenAuth) is a valid authkey and is the intended
  // credential for widget endpoints, so we always have that as a fallback. If a
  // separate account authkey (MSG91_AUTHKEY) is set we try it first, but if MSG91
  // rejects it as invalid (code 418) we automatically retry with the widget token
  // — so a stale/wrong MSG91_AUTHKEY in the deploy env can't break login.
  const widgetToken = process.env.NEXT_PUBLIC_MSG91_AUTH_TOKEN?.trim();
  const accountKey = process.env.MSG91_AUTHKEY?.trim();
  const primaryKey = accountKey || widgetToken;
  if (!primaryKey) {
    return NextResponse.json({ error: "OTP verification is not configured." }, { status: 500 });
  }

  let result: Msg91VerifyResult;
  try {
    result = await verifyWithMsg91(primaryKey, accessToken);
    // Auto-fallback: the account authkey was rejected, retry with the widget token.
    if (!result.ok && result.code === "418" && widgetToken && widgetToken !== primaryKey) {
      result = await verifyWithMsg91(widgetToken, accessToken);
    }
  } catch {
    return NextResponse.json({ error: "Could not reach OTP provider." }, { status: 502 });
  }

  if (!result.ok) {
    // Surface the underlying MSG91 code so auth-key vs token issues are diagnosable.
    const detail = result.code ? `${result.message} (code ${result.code})` : result.message;
    return NextResponse.json(
      { error: detail || "OTP verification failed." },
      { status: 401 },
    );
  }

  const supabase = getSupabaseAdminClient();
  const fullPhone = `91${phone}`;

  const { data: existing, error: lookupError } = await supabase
    .from("customers")
    .select("id, name")
    .eq("phone", fullPhone)
    .maybeSingle();

  if (lookupError) {
    return NextResponse.json({ error: "Could not look up customer." }, { status: 500 });
  }

  let customerId: string;
  let customerName: string | null;

  if (existing) {
    customerId = existing.id as string;
    customerName = (existing.name as string | null) ?? (name || null);
    const { error: updateError } = await supabase
      .from("customers")
      .update({
        last_login_at: new Date().toISOString(),
        ...(name && !existing.name ? { name } : {}),
      })
      .eq("id", customerId);
    if (updateError) {
      return NextResponse.json({ error: "Could not update customer." }, { status: 500 });
    }
  } else {
    const { data: created, error: insertError } = await supabase
      .from("customers")
      .insert({ phone: fullPhone, name: name || null })
      .select("id, name")
      .single();
    if (insertError || !created) {
      return NextResponse.json({ error: "Could not create customer." }, { status: 500 });
    }
    customerId = created.id as string;
    customerName = (created.name as string | null) ?? null;
  }

  await createSessionCookie({ customerId, phone: fullPhone, name: customerName });

  return NextResponse.json({
    ok: true,
    user: { customerId, phone: fullPhone, name: customerName },
  });
}
