import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ account: null });

  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("customers")
    .select("name, phone, wallet_balance")
    .eq("id", session.customerId)
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json({ error: "Could not load account." }, { status: 500 });
  }

  return NextResponse.json({
    account: {
      name: data.name as string | null,
      phone: data.phone as string,
      walletBalance: data.wallet_balance as number,
    },
  });
}
