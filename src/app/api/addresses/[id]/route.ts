import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Please log in." }, { status: 401 });

  const { id } = await params;
  const supabase = getSupabaseAdminClient();
  const { error } = await supabase
    .from("saved_addresses")
    .delete()
    .eq("id", id)
    .eq("customer_id", session.customerId); // scope to owner

  if (error) {
    return NextResponse.json({ error: "Could not delete address." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
