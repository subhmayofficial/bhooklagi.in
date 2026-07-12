import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

const PHONE_RE = /^[6-9]\d{9}$/;

export async function POST(req: NextRequest) {
  const session = await getSession();
  const body = await req.json().catch(() => null);
  const name = session?.name ?? (typeof body?.name === "string" ? body.name.trim().slice(0, 100) : null);
  const phone = session?.phone ?? (typeof body?.phone === "string" ? body.phone.trim() : "");

  if (!session && !phone) {
    return NextResponse.json({ error: "Please log in to get notified." }, { status: 401 });
  }

  if (!phone || !PHONE_RE.test(phone)) {
    return NextResponse.json({ error: "Please enter a valid 10-digit mobile number." }, { status: 400 });
  }

  const supabase = getSupabaseAdminClient();

  const { error } = await supabase
    .from("kitchen_notifications")
    .insert({
      name: name || null,
      phone,
    });

  if (error) {
    console.error("Error creating kitchen notification subscriber:", error);
    return NextResponse.json({ error: "Failed to subscribe. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ success: true, message: "Subscription saved successfully! We'll alert you once we reopen." });
}
