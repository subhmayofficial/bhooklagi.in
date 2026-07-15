import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const host = req.headers.get("host")?.toLowerCase().split(":")[0];

  if (host === "bhooklagi.in") {
    const url = req.nextUrl.clone();
    url.protocol = "https";
    url.hostname = "www.bhooklagi.in";
    url.port = "";
    return NextResponse.redirect(url, 301);
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/:path*",
};
