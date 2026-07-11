import { NextRequest, NextResponse } from "next/server";
import { isAdminSession } from "@/lib/auth/admin-session";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };

  if (typeof body.name === "string" && body.name.trim()) update.name = body.name.trim();
  if (typeof body.description === "string") update.description = body.description.trim();
  if (typeof body.price === "number" && body.price > 0) update.price = Math.round(body.price);
  if (typeof body.emoji === "string") update.emoji = body.emoji.trim() || "🍽️";
  if (typeof body.imageUrl === "string") update.image_url = body.imageUrl.trim() || null;
  if (body.imageUrl === null) update.image_url = null;
  if (typeof body.categoryId === "string") update.category_id = body.categoryId;
  if (typeof body.diet === "string") update.diet = body.diet || null;
  if (typeof body.spicy === "boolean") update.spicy = body.spicy;
  if (typeof body.bestseller === "boolean") update.bestseller = body.bestseller;
  if (typeof body.isAvailable === "boolean") update.is_available = body.isAvailable;

  const supabase = getSupabaseAdminClient();
  const { error } = await supabase.from("custom_menu_items").update(update).eq("id", id);
  if (error) {
    return NextResponse.json({ error: "Could not update item." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const supabase = getSupabaseAdminClient();
  const { error } = await supabase.from("custom_menu_items").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: "Could not delete item." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
