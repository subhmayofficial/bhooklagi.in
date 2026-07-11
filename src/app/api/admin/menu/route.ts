import { NextResponse } from "next/server";
import { isAdminSession } from "@/lib/auth/admin-session";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { menuItems } from "@/data/menu";

export async function GET() {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseAdminClient();
  const { data: rows } = await supabase
    .from("menu_items")
    .select("id, price, image_url, is_available, updated_at");

  const overrideMap: Record<string, { price: number | null; imageUrl: string | null; isAvailable: boolean; updatedAt: string }> = {};
  for (const r of rows ?? []) {
    overrideMap[r.id as string] = {
      price: r.price as number | null,
      imageUrl: r.image_url as string | null,
      isAvailable: (r.is_available as boolean) ?? true,
      updatedAt: r.updated_at as string,
    };
  }

  const items = menuItems.map((item) => {
    const ov = overrideMap[item.id];
    return {
      id: item.id,
      name: item.name,
      emoji: item.emoji,
      categoryId: item.categoryId,
      defaultPrice: item.price,
      defaultImage: item.image ?? null,
      price: ov?.price ?? item.price,
      imageUrl: ov?.imageUrl ?? item.image ?? null,
      isAvailable: ov ? ov.isAvailable : true,
      hasOverride: !!ov,
      updatedAt: ov?.updatedAt ?? null,
    };
  });

  return NextResponse.json({ items });
}
