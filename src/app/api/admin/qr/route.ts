import { NextRequest, NextResponse } from "next/server";
import { isAdminSession } from "@/lib/auth/admin-session";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

type QrCampaignRow = {
  id: string;
  title: string;
  slug: string;
  destination_url: string;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

type QrScanRow = {
  id: string;
  campaign_id: string;
  scanned_at: string;
  ip_address: string | null;
  user_agent: string | null;
  referrer: string | null;
  device_type: string | null;
  browser: string | null;
  os: string | null;
  country: string | null;
  city: string | null;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

function isMissingQrTables(error: { code?: string; message?: string } | null) {
  return error?.code === "42P01" || /qr_campaigns|qr_scans/i.test(error?.message ?? "") && /does not exist/i.test(error?.message ?? "");
}

function normalizeUrl(value: unknown) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("/")) return trimmed;
  try {
    const url = new URL(trimmed);
    if (url.protocol === "http:" || url.protocol === "https:") return url.toString();
  } catch {
    return null;
  }
  return null;
}

function mapCampaign(row: QrCampaignRow, scanCount: number, latestScanAt: string | null) {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    destinationUrl: row.destination_url,
    notes: row.notes,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    scanCount,
    latestScanAt,
  };
}

export async function GET() {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseAdminClient();
  const { data: campaigns, error: campaignsError } = await supabase
    .from("qr_campaigns")
    .select("id, title, slug, destination_url, notes, is_active, created_at, updated_at")
    .order("created_at", { ascending: false });

  if (campaignsError) {
    if (isMissingQrTables(campaignsError)) {
      return NextResponse.json({
        campaigns: [],
        scans: [],
        setupWarning: "QR tracking tables are missing. Run the latest Supabase migration.",
      });
    }
    return NextResponse.json({ error: campaignsError.message || "Could not load QR campaigns." }, { status: 500 });
  }

  const { data: scans, error: scansError } = await supabase
    .from("qr_scans")
    .select("id, campaign_id, scanned_at, ip_address, user_agent, referrer, device_type, browser, os, country, city")
    .order("scanned_at", { ascending: false })
    .limit(500);

  if (scansError) {
    if (isMissingQrTables(scansError)) {
      return NextResponse.json({
        campaigns: [],
        scans: [],
        setupWarning: "QR tracking tables are missing. Run the latest Supabase migration.",
      });
    }
    return NextResponse.json({ error: scansError.message || "Could not load QR scans." }, { status: 500 });
  }

  const campaignRows = (campaigns ?? []) as QrCampaignRow[];
  const statsEntries = await Promise.all(
    campaignRows.map(async (campaign) => {
      const { data, count } = await supabase
        .from("qr_scans")
        .select("scanned_at", { count: "exact" })
        .eq("campaign_id", campaign.id)
        .order("scanned_at", { ascending: false })
        .limit(1);

      return [campaign.id, { count: count ?? 0, latest: (data?.[0]?.scanned_at as string | undefined) ?? null }] as const;
    }),
  );
  const statsByCampaign = new Map(statsEntries);

  const campaignNameById = new Map((campaigns ?? []).map((campaign) => [campaign.id as string, campaign.title as string]));

  return NextResponse.json({
    campaigns: campaignRows.map((campaign) => {
      const stats = statsByCampaign.get(campaign.id) ?? { count: 0, latest: null };
      return mapCampaign(campaign, stats.count, stats.latest);
    }),
    scans: ((scans ?? []) as QrScanRow[]).map((scan) => ({
      id: scan.id,
      campaignId: scan.campaign_id,
      campaignTitle: campaignNameById.get(scan.campaign_id) ?? "Deleted QR",
      scannedAt: scan.scanned_at,
      ipAddress: scan.ip_address,
      userAgent: scan.user_agent,
      referrer: scan.referrer,
      deviceType: scan.device_type,
      browser: scan.browser,
      os: scan.os,
      country: scan.country,
      city: scan.city,
    })),
    setupWarning: null,
  });
}

export async function POST(req: NextRequest) {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const destinationUrl = normalizeUrl(body.destinationUrl);
  const notes = typeof body.notes === "string" && body.notes.trim() ? body.notes.trim() : null;
  const requestedSlug = typeof body.slug === "string" ? slugify(body.slug) : "";
  const slug = requestedSlug || slugify(title);

  if (!title) return NextResponse.json({ error: "QR name is required." }, { status: 400 });
  if (!slug) return NextResponse.json({ error: "QR slug is required." }, { status: 400 });
  if (!destinationUrl) return NextResponse.json({ error: "Valid destination URL is required." }, { status: 400 });

  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("qr_campaigns")
    .insert({
      title,
      slug,
      destination_url: destinationUrl,
      notes,
      is_active: true,
    })
    .select("id, title, slug, destination_url, notes, is_active, created_at, updated_at")
    .single();

  if (error) {
    if (isMissingQrTables(error)) {
      return NextResponse.json({ error: "QR tracking tables are missing. Run the latest Supabase migration." }, { status: 500 });
    }
    if (error.code === "23505") return NextResponse.json({ error: "This QR slug already exists." }, { status: 409 });
    return NextResponse.json({ error: error.message || "Could not create QR campaign." }, { status: 500 });
  }

  return NextResponse.json({ campaign: mapCampaign(data as QrCampaignRow, 0, null) });
}

export async function PATCH(req: NextRequest) {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const id = typeof body.id === "string" ? body.id : "";
  if (!id) return NextResponse.json({ error: "Missing QR campaign ID." }, { status: 400 });

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (typeof body.title === "string") updates.title = body.title.trim();
  if (typeof body.slug === "string") updates.slug = slugify(body.slug);
  if (body.destinationUrl !== undefined) {
    const destinationUrl = normalizeUrl(body.destinationUrl);
    if (!destinationUrl) return NextResponse.json({ error: "Valid destination URL is required." }, { status: 400 });
    updates.destination_url = destinationUrl;
  }
  if (body.notes !== undefined) updates.notes = typeof body.notes === "string" && body.notes.trim() ? body.notes.trim() : null;
  if (body.isActive !== undefined) updates.is_active = body.isActive === true;

  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("qr_campaigns")
    .update(updates)
    .eq("id", id)
    .select("id, title, slug, destination_url, notes, is_active, created_at, updated_at")
    .single();

  if (error) {
    if (error.code === "23505") return NextResponse.json({ error: "This QR slug already exists." }, { status: 409 });
    return NextResponse.json({ error: error.message || "Could not update QR campaign." }, { status: 500 });
  }

  return NextResponse.json({ campaign: mapCampaign(data as QrCampaignRow, 0, null) });
}

export async function DELETE(req: NextRequest) {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing QR campaign ID." }, { status: 400 });

  const supabase = getSupabaseAdminClient();
  const { error } = await supabase.from("qr_campaigns").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message || "Could not delete QR campaign." }, { status: 500 });

  return NextResponse.json({ success: true });
}
