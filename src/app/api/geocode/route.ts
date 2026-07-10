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

  // Bias geocoding to Deoghar city limits so vague locality names resolve
  // within the city instead of defaulting to some other matching city/state.
  // Deoghar bounding box: SW 24.46,86.68  NE 24.51,86.73
  const DEOGHAR_BOUNDS = "24.46,86.68|24.51,86.73";

  const params = new URLSearchParams({
    address,
    key,
    region: "in",
    bounds: DEOGHAR_BOUNDS,
    components: "country:IN|administrative_area:JH",
  });
  const url = `https://maps.googleapis.com/maps/api/geocode/json?${params}`;
  const res = await fetch(url);
  const data = await res.json() as {
    status: string;
    results: { geometry: { location: { lat: number; lng: number }; location_type: string }; formatted_address: string }[];
  };

  if (data.status !== "OK" || !data.results[0]) {
    // Retry without the strict components filter (some addresses fail with it)
    const fallbackParams = new URLSearchParams({ address, key, region: "in", bounds: DEOGHAR_BOUNDS });
    const fallbackRes = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?${fallbackParams}`);
    const fallbackData = await fallbackRes.json() as typeof data;
    if (fallbackData.status !== "OK" || !fallbackData.results[0]) {
      return NextResponse.json({ error: "Could not geocode address.", status: data.status }, { status: 404 });
    }
    const { lat, lng } = fallbackData.results[0].geometry.location;
    return NextResponse.json({ lat, lng, formatted: fallbackData.results[0].formatted_address });
  }

  const { lat, lng } = data.results[0].geometry.location;
  return NextResponse.json({ lat, lng, formatted: data.results[0].formatted_address });
}
