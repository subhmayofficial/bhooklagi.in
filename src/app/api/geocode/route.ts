import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const address = req.nextUrl.searchParams.get("address");
  if (!address) {
    return NextResponse.json({ error: "Missing address parameter." }, { status: 400 });
  }

  const key = process.env.GOOGLE_API;
  if (!key) {
    return NextResponse.json({ error: "Geocoding not configured." }, { status: 500 });
  }

  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${key}&region=in`;
  const res = await fetch(url);
  const data = await res.json() as {
    status: string;
    results: { geometry: { location: { lat: number; lng: number } }; formatted_address: string }[];
  };

  if (data.status !== "OK" || !data.results[0]) {
    return NextResponse.json({ error: "Could not geocode address.", status: data.status }, { status: 404 });
  }

  const { lat, lng } = data.results[0].geometry.location;
  return NextResponse.json({ lat, lng, formatted: data.results[0].formatted_address });
}
