import { NextResponse } from "next/server";
import { isAdminSession } from "@/lib/auth/admin-session";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  if (!(await isAdminSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("freebies")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: "Could not fetch freebies." }, { status: 500 });
  return NextResponse.json({ freebies: data ?? [] });
}

export async function POST(req: Request) {
  if (!(await isAdminSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const { name, description, emoji, minOrder } = body as Record<string, unknown>;
  if (!name || typeof name !== "string" || !name.trim())
    return NextResponse.json({ error: "Name is required." }, { status: 400 });

  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("freebies")
    .insert({
      name: (name as string).trim(),
      description: typeof description === "string" ? description.trim() || null : null,
      emoji: typeof emoji === "string" && emoji.trim() ? emoji.trim() : "🎁",
      min_order: Number.isInteger(minOrder) ? (minOrder as number) : 0,
    })
    .select()
    .single();
  if (error) return NextResponse.json({ error: "Could not create freebie." }, { status: 500 });
  return NextResponse.json({ freebie: data });
}
