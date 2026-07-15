import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

const PUBLIC_SITE_ORIGIN = "https://www.bhooklagi.in";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

function firstHeaderValue(value: string | null) {
  return value?.split(",")[0]?.trim() || null;
}

function detectDevice(userAgent: string) {
  const ua = userAgent.toLowerCase();
  if (/ipad|tablet/.test(ua)) return "tablet";
  if (/mobi|android|iphone|ipod/.test(ua)) return "mobile";
  if (/bot|crawler|spider|slurp/.test(ua)) return "bot";
  return "desktop";
}

function detectBrowser(userAgent: string) {
  if (/edg\//i.test(userAgent)) return "Edge";
  if (/opr\//i.test(userAgent)) return "Opera";
  if (/chrome|crios/i.test(userAgent)) return "Chrome";
  if (/safari/i.test(userAgent) && !/chrome|crios/i.test(userAgent)) return "Safari";
  if (/firefox|fxios/i.test(userAgent)) return "Firefox";
  return "Unknown";
}

function detectOs(userAgent: string) {
  if (/iphone|ipad|ipod/i.test(userAgent)) return "iOS";
  if (/android/i.test(userAgent)) return "Android";
  if (/mac os x|macintosh/i.test(userAgent)) return "macOS";
  if (/windows/i.test(userAgent)) return "Windows";
  if (/linux/i.test(userAgent)) return "Linux";
  return "Unknown";
}

function fallbackUrl() {
  return new URL("/menu", PUBLIC_SITE_ORIGIN);
}

function safeRedirectUrl(destination: string) {
  if (destination.startsWith("/")) return new URL(destination, PUBLIC_SITE_ORIGIN);
  try {
    const url = new URL(destination);
    if (url.hostname === "localhost" || url.hostname === "127.0.0.1" || url.hostname.startsWith("192.168.")) {
      return new URL(`${url.pathname}${url.search}${url.hash}`, PUBLIC_SITE_ORIGIN);
    }
    if (url.protocol === "http:" || url.protocol === "https:") return url;
  } catch {
    return fallbackUrl();
  }
  return fallbackUrl();
}

export async function GET(req: NextRequest, context: RouteContext) {
  const { slug } = await context.params;
  const supabase = getSupabaseAdminClient();

  const { data: campaign, error } = await supabase
    .from("qr_campaigns")
    .select("id, destination_url, is_active")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !campaign || campaign.is_active !== true) {
    return NextResponse.redirect(fallbackUrl(), { status: 302 });
  }

  const userAgent = req.headers.get("user-agent") ?? "";
  const ipAddress =
    firstHeaderValue(req.headers.get("x-forwarded-for")) ??
    req.headers.get("x-real-ip") ??
    req.headers.get("cf-connecting-ip") ??
    null;

  await supabase.from("qr_scans").insert({
    campaign_id: campaign.id,
    ip_address: ipAddress,
    user_agent: userAgent || null,
    referrer: req.headers.get("referer"),
    device_type: detectDevice(userAgent),
    browser: detectBrowser(userAgent),
    os: detectOs(userAgent),
    country: req.headers.get("x-vercel-ip-country") ?? req.headers.get("cf-ipcountry"),
    city: req.headers.get("x-vercel-ip-city"),
  });

  return NextResponse.redirect(safeRedirectUrl(campaign.destination_url as string), { status: 302 });
}
