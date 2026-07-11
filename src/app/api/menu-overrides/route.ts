import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export const revalidate = 0;

export async function GET() {
  const supabase = getSupabaseAdminClient();

  const [{ data: overrideRows }, { data: customRows }] = await Promise.all([
    supabase.from("menu_items").select("id, price, image_url, is_available"),
    supabase.from("custom_menu_items").select("*").eq("is_available", true).order("sort_order"),
  ]);

  const overrides: Record<string, { price?: number; imageUrl?: string; isAvailable: boolean }> = {};
  for (const row of overrideRows ?? []) {
    overrides[row.id as string] = {
      price: (row.price as number | null) ?? undefined,
      imageUrl: (row.image_url as string | null) ?? undefined,
      isAvailable: (row.is_available as boolean) ?? true,
    };
  }

  const customItems = (customRows ?? []).map((r) => ({
    id: r.id as string,
    name: r.name as string,
    description: (r.description as string) ?? "",
    price: r.price as number,
    emoji: (r.emoji as string) ?? "🍽️",
    imageUrl: (r.image_url as string | null) ?? null,
    categoryId: r.category_id as string,
    diet: (r.diet as string | null) ?? undefined,
    spicy: (r.spicy as boolean) ?? false,
    bestseller: (r.bestseller as boolean) ?? false,
    isAvailable: true,
  }));

  return NextResponse.json({ overrides, customItems });
}
