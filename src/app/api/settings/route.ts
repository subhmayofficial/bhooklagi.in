import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("store_settings")
    .select("*")
    .eq("id", "default")
    .single();

  if (error || !data) {
    // Return sensible defaults if table doesn't exist or row missing
    return NextResponse.json({
      settings: {
        delivery_charge: 49,
        free_delivery_threshold: 299,
        tax_percent: 5,
        upi_discount_enabled: false,
        upi_discount_percent: 0,
      }
    });
  }

  return NextResponse.json({ settings: data });
}
