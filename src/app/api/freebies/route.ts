import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("freebies")
    .select("id, name, description, emoji, min_order")
    .eq("is_active", true)
    .order("min_order", { ascending: true });

  if (error) return NextResponse.json({ freebies: [] });
  return NextResponse.json({ freebies: data ?? [] });
}
