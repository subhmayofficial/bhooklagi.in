import { NextResponse } from "next/server";
import { isAdminSession } from "@/lib/auth/admin-session";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("freebies")
    .update({ is_active: Boolean(body.isActive) })
    .eq("id", id)
    .select()
    .single();
  if (error) return NextResponse.json({ error: "Could not update freebie." }, { status: 500 });
  return NextResponse.json({ freebie: data });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const supabase = getSupabaseAdminClient();
  const { error } = await supabase.from("freebies").delete().eq("id", id);
  if (error) return NextResponse.json({ error: "Could not delete freebie." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
