import { NextResponse } from "next/server";
import { isAdminSession } from "@/lib/auth/admin-session";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { menuItems } from "@/data/menu";

export async function GET() {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseAdminClient();
  const [{ data: overrideRows }, { data: customRows }] = await Promise.all([
    supabase.from("menu_items").select("id, name, price, image_url, is_available, updated_at"),
    supabase.from("custom_menu_items").select("*").order("sort_order").order("created_at"),
  ]);

  const overrideMap: Record<string, { name: string | null; price: number | null; imageUrl: string | null; isAvailable: boolean; updatedAt: string }> = {};
  for (const r of overrideRows ?? []) {
    overrideMap[r.id as string] = {
      name: (r.name as string | null) ?? null,
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
      name: ov?.name ?? item.name,
      emoji: item.emoji,
      categoryId: item.categoryId,
      defaultPrice: item.price,
      defaultImage: item.image ?? null,
      price: ov?.price ?? item.price,
      imageUrl: ov?.imageUrl ?? item.image ?? null,
      isAvailable: ov ? ov.isAvailable : true,
      hasOverride: !!ov,
      updatedAt: ov?.updatedAt ?? null,
      isCustom: false,
    };
  });

  const customItems = (customRows ?? []).map((r) => ({
    id: r.id as string,
    name: r.name as string,
    emoji: (r.emoji as string) ?? "🍽️",
    categoryId: r.category_id as string,
    defaultPrice: r.price as number,
    defaultImage: (r.image_url as string | null),
    price: r.price as number,
    imageUrl: (r.image_url as string | null),
    isAvailable: (r.is_available as boolean) ?? true,
    hasOverride: false,
    updatedAt: r.updated_at as string,
    isCustom: true,
    description: (r.description as string) ?? "",
    diet: (r.diet as string | null) ?? null,
    spicy: (r.spicy as boolean) ?? false,
    bestseller: (r.bestseller as boolean) ?? false,
  }));

  return NextResponse.json({ items, customItems });
}
