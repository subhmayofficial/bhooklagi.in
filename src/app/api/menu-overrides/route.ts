import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export const revalidate = 0;

export async function GET() {
  const supabase = getSupabaseAdminClient();
  const { data } = await supabase
    .from("menu_items")
    .select("id, price, image_url, is_available");

  const overrides: Record<string, { price?: number; imageUrl?: string; isAvailable: boolean }> = {};
  for (const row of data ?? []) {
    overrides[row.id as string] = {
      price: (row.price as number | null) ?? undefined,
      imageUrl: (row.image_url as string | null) ?? undefined,
      isAvailable: (row.is_available as boolean) ?? true,
    };
  }

  return NextResponse.json({ overrides });
}
