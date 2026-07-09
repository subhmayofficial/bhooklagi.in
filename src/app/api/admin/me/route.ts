import { NextResponse } from "next/server";
import { isAdminSession } from "@/lib/auth/admin-session";

export async function GET() {
  const authed = await isAdminSession();
  return NextResponse.json({ authed });
}
