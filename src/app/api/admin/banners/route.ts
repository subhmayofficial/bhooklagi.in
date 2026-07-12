import { NextResponse } from "next/server";
import { isAdminSession } from "@/lib/auth/admin-session";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  if (!(await isAdminSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("promotional_banners")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ banners: data });
}

export async function POST(req: Request) {
  if (!(await isAdminSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const supabase = getSupabaseAdminClient();

  const { data, error } = await supabase
    .from("promotional_banners")
    .insert({
      title: body.title,
      subtitle: body.subtitle || null,
      coupon_code: body.coupon_code || null,
      theme_color: body.theme_color || 'orange',
      is_active: true,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ banner: data });
}

export async function PATCH(req: Request) {
  if (!(await isAdminSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  if (!body.id) return NextResponse.json({ error: "Missing banner ID" }, { status: 400 });

  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("promotional_banners")
    .update({
      title: body.title,
      subtitle: body.subtitle || null,
      coupon_code: body.coupon_code || null,
      theme_color: body.theme_color || 'orange',
      is_active: body.is_active,
    })
    .eq("id", body.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ banner: data });
}

export async function DELETE(req: Request) {
  if (!(await isAdminSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing banner ID" }, { status: 400 });

  const supabase = getSupabaseAdminClient();
  const { error } = await supabase.from("promotional_banners").delete().eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
