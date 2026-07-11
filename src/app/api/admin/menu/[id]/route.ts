import { NextRequest, NextResponse } from "next/server";
import { isAdminSession } from "@/lib/auth/admin-session";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { menuItems } from "@/data/menu";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (!menuItems.some((m) => m.id === id)) {
    return NextResponse.json({ error: "Item not found." }, { status: 404 });
  }

  const body = await req.json().catch(() => ({}));
  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };

  if (typeof body.price === "number" && body.price > 0) {
    update.price = Math.round(body.price);
  } else if (body.price === null) {
    update.price = null;
  }
  if (typeof body.imageUrl === "string") {
    update.image_url = body.imageUrl.trim() || null;
  }
  if (typeof body.isAvailable === "boolean") {
    update.is_available = body.isAvailable;
  }

  const supabase = getSupabaseAdminClient();
  const { error } = await supabase
    .from("menu_items")
    .upsert({ id, ...update }, { onConflict: "id" });

  if (error) {
    return NextResponse.json({ error: "Could not update item." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
