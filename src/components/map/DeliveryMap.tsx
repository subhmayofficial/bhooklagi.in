"use client";

import { useEffect, useRef, useState } from "react";
import { Navigation, MapPin } from "lucide-react";

// ─── Minimal Google Maps type shims ────────────────────────────────────────
type GMLatLng = { lat(): number; lng(): number };
type GMMap = {
  fitBounds(b: object): void;
  getZoom(): number;
  setZoom(z: number): void;
};
type GMMarker = { setMap(m: GMMap | null): void };
type GMPolyline = { setMap(m: GMMap | null): void };
type GMBounds = { extend(latlng: object): void };

interface GoogleMapsNamespace {
  Map: new (el: HTMLElement, opts: object) => GMMap;
  Marker: new (opts: object) => GMMarker;
  Polyline: new (opts: object) => GMPolyline;
  LatLng: new (lat: number, lng: number) => GMLatLng;
  LatLngBounds: new () => GMBounds;
  SymbolPath: { CIRCLE: number };
  DirectionsService: new () => {
    route(
      req: object,
      cb: (result: GoogleDirectionsResult | null, status: string) => void,
    ): void;
  };
  TravelMode: { DRIVING: string };
  DirectionsStatus: { OK: string };
}

interface GoogleDirectionsResult {
  routes: {
    overview_path: GMLatLng[];
    legs: { duration: { value: number } }[];
  }[];
}

declare global {
  interface Window {
    google?: { maps: GoogleMapsNamespace };
    initGoogleMaps?: () => void;
  }
}

// ─── Status → how far along the line is filled ────────────────────────────
type Status = "placed" | "preparing" | "out_for_delivery" | "delivered" | "cancelled";

const STATUS_PROGRESS: Record<Status, number> = {
  placed: 0.0,
  preparing: 0.28,
  out_for_delivery: 0.72,
  delivered: 1.0,
  cancelled: 0.0,
};

type Coords = { lat: number; lng: number };

// ─── Load Google Maps JS API once per page ─────────────────────────────────
function loadGoogleMaps(key: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.google?.maps) { resolve(); return; }
    const existing = document.querySelector('script[data-gm]');
    if (existing) { existing.addEventListener("load", () => resolve()); return; }
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=geometry`;
    script.async = true;
    script.defer = true;
    script.dataset.gm = "1";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google Maps"));
    document.head.appendChild(script);
  });
}

// ─── Server-side geocode via /api/geocode ──────────────────────────────────
async function geocodeAddress(address: string): Promise<Coords | null> {
  try {
    const res = await fetch(`/api/geocode?address=${encodeURIComponent(address)}`);
    if (!res.ok) return null;
    const d = await res.json() as { lat?: number; lng?: number };
    if (d.lat && d.lng) return { lat: d.lat, lng: d.lng };
    return null;
  } catch { return null; }
}

// ─── Component ─────────────────────────────────────────────────────────────
type Props = {
  deliveryAddress: string;
  status: Status;
};

export function DeliveryMap({ deliveryAddress, status }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<GMMap | null>(null);
  const markersRef = useRef<GMMarker[]>([]);
  const linesRef = useRef<GMPolyline[]>([]);

  const [eta, setEta] = useState<number | null>(null);
  const [geoError, setGeoError] = useState(false);
  const [loading, setLoading] = useState(true);

  const progress = STATUS_PROGRESS[status] ?? 0;

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;
    if (!key || !mapRef.current) return;

    let cancelled = false;

    async function build() {
      try {
        // 1. Load Maps JS API
        await loadGoogleMaps(key!);
        if (cancelled) return;

        // 2a. Kitchen — prefer exact lat/lng from env vars so it's always right.
        //     Fallback: geocode the KITCHEN_ADDRESS env var.
        //     IMPORTANT: set NEXT_PUBLIC_KITCHEN_LAT + NEXT_PUBLIC_KITCHEN_LNG
        //     in your hosting env to pin the kitchen exactly.
        let kitchenCoords: Coords;
        const kitchenLat = parseFloat(process.env.NEXT_PUBLIC_KITCHEN_LAT ?? "");
        const kitchenLng = parseFloat(process.env.NEXT_PUBLIC_KITCHEN_LNG ?? "");
        if (!isNaN(kitchenLat) && !isNaN(kitchenLng)) {
          kitchenCoords = { lat: kitchenLat, lng: kitchenLng };
        } else {
          const kitchenAddr = process.env.NEXT_PUBLIC_KITCHEN_ADDRESS ?? "Deoghar, Jharkhand, India";
          const geocodedKitchen = await geocodeAddress(kitchenAddr);
          kitchenCoords = geocodedKitchen ?? { lat: 24.4860, lng: 86.6985 };
        }

        // 2b. Customer address — keep it city-scoped for accuracy
        const customer = await geocodeAddress(deliveryAddress);
        if (cancelled) return;

        const customerCoords = customer ?? { lat: 24.4910, lng: 86.6920 };
        if (!customer) setGeoError(true);

        const G = window.google!.maps;

        // 3. Create or reuse map
        let m = mapInstanceRef.current;
        if (!m) {
          m = new G.Map(mapRef.current!, {
            center: { lat: (kitchenCoords.lat + customerCoords.lat) / 2, lng: (kitchenCoords.lng + customerCoords.lng) / 2 },
            zoom: 14,
            disableDefaultUI: true,
            gestureHandling: "cooperative",
            mapTypeId: "roadmap",
            styles: [
              { featureType: "poi", stylers: [{ visibility: "off" }] },
              { featureType: "transit", stylers: [{ visibility: "off" }] },
              { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
            ],
          });
          mapInstanceRef.current = m;
        }

        // 4. Clear previous markers/lines
        markersRef.current.forEach((mk) => mk.setMap(null));
        linesRef.current.forEach((ln) => ln.setMap(null));
        markersRef.current = [];
        linesRef.current = [];

        // 5. Markers
        const kitchenMarker = new G.Marker({
          position: { lat: kitchenCoords.lat, lng: kitchenCoords.lng },
          map: m,
          title: "Bhook Lagi Kitchen",
          icon: {
            url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
              <svg xmlns="http://www.w3.org/2000/svg" width="42" height="52" viewBox="0 0 42 52">
                <path fill="#E85D04" d="M21 0C9.4 0 0 9.4 0 21c0 16 21 31 21 31s21-15 21-31C42 9.4 32.6 0 21 0z"/>
                <text x="21" y="27" text-anchor="middle" font-size="18">🍔</text>
              </svg>`),
            scaledSize: { width: 42, height: 52 },
            anchor: { x: 21, y: 52 },
          },
        });

        const customerMarker = new G.Marker({
          position: { lat: customerCoords.lat, lng: customerCoords.lng },
          map: m,
          title: "Your location",
          icon: {
            url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
              <svg xmlns="http://www.w3.org/2000/svg" width="42" height="52" viewBox="0 0 42 52">
                <path fill="#3B82F6" d="M21 0C9.4 0 0 9.4 0 21c0 16 21 31 21 31s21-15 21-31C42 9.4 32.6 0 21 0z"/>
                <circle cx="21" cy="21" r="8" fill="white"/>
                <circle cx="21" cy="21" r="5" fill="#3B82F6"/>
              </svg>`),
            scaledSize: { width: 42, height: 52 },
            anchor: { x: 21, y: 52 },
          },
        });

        markersRef.current = [kitchenMarker, customerMarker];

        // 6. Get actual road route via Directions Service
        const directionsService = new G.DirectionsService();
        directionsService.route(
          {
            origin: new G.LatLng(kitchenCoords.lat, kitchenCoords.lng),
            destination: new G.LatLng(customerCoords.lat, customerCoords.lng),
            travelMode: G.TravelMode.DRIVING,
          },
          (result, status) => {
            if (cancelled || !result || status !== G.DirectionsStatus.OK) {
              // Fallback: straight line
              drawLines(m!, G, [
                { lat: kitchenCoords.lat, lng: kitchenCoords.lng },
                { lat: customerCoords.lat, lng: customerCoords.lng },
              ], progress);
              fitMap(m!, G, kitchenCoords, customerCoords);
              return;
            }

            const route = result.routes[0];
            const path = route.overview_path.map((p) => ({ lat: p.lat(), lng: p.lng() }));
            const totalMinutes = Math.ceil((route.legs[0].duration.value / 60) * 1.3 + 10);
            setEta(totalMinutes);

            drawLines(m!, G, path, progress);
            fitMap(m!, G, kitchenCoords, customerCoords);
          },
        );

        // Add rider marker for out_for_delivery
        if (status === "out_for_delivery") {
          const midLat = kitchenCoords.lat + (customerCoords.lat - kitchenCoords.lat) * progress;
          const midLng = kitchenCoords.lng + (customerCoords.lng - kitchenCoords.lng) * progress;
          const riderMarker = new G.Marker({
            position: { lat: midLat, lng: midLng },
            map: m,
            title: "Rider",
            icon: {
              url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
                <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="18" fill="#FAA307"/>
                  <text x="18" y="24" text-anchor="middle" font-size="18">🛵</text>
                </svg>`),
              scaledSize: { width: 36, height: 36 },
              anchor: { x: 18, y: 18 },
            },
          });
          markersRef.current.push(riderMarker);
        }

      } catch {
        setGeoError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    build();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deliveryAddress, status]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      markersRef.current.forEach((mk) => mk.setMap(null));
      linesRef.current.forEach((ln) => ln.setMap(null));
    };
  }, []);

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-sm">
      {/* ETA banner */}
      {status !== "delivered" && status !== "cancelled" && (
        <div className="flex items-center justify-between bg-gradient-to-r from-brand-orange to-brand-gold px-4 py-2.5">
          <div className="flex items-center gap-2">
            <Navigation className="h-4 w-4 text-white" strokeWidth={2.5} />
            <span className="text-[13px] font-bold text-white">
              {status === "out_for_delivery" ? "Rider on the way!" : "Order being prepared"}
            </span>
          </div>
          {eta !== null && (
            <span className="rounded-full bg-white/20 px-3 py-1 text-[12px] font-extrabold text-white">
              ~{eta} min
            </span>
          )}
        </div>
      )}

      <div className="relative">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-100">
            <div className="flex flex-col items-center gap-2">
              <MapPin className="h-6 w-6 animate-bounce text-brand-orange" />
              <p className="text-[12px] text-gray-500">Loading map…</p>
            </div>
          </div>
        )}
        <div ref={mapRef} style={{ height: "250px", width: "100%", background: "#e5e3df" }} />
        {geoError && (
          <div className="absolute bottom-2 left-2 rounded-lg bg-amber-50 px-2 py-1 text-[10px] font-semibold text-amber-700 shadow ring-1 ring-amber-200">
            ⚠️ Approx. location — update KITCHEN_ADDRESS in settings
          </div>
        )}
      </div>

      <div className="flex items-center justify-between bg-gray-50 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="text-[14px]">🍔</span>
          <span className="text-[11px] font-semibold text-gray-600">Kitchen</span>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-gray-400">
          <div className="h-0.5 w-6 bg-gray-300" style={{ borderTop: "2px dashed #D1D5DB" }} />
          <div className="h-0.5 w-4 rounded bg-brand-orange" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-gray-600">You</span>
          <span className="text-[14px]">📍</span>
        </div>
      </div>
    </div>
  );
}

// ─── Helpers ───────────────────────────────────────────────────────────────
function drawLines(
  m: GMMap,
  G: GoogleMapsNamespace,
  path: { lat: number; lng: number }[],
  progress: number,
) {
  // Full path — gray dashed
  const fullLine = new G.Polyline({
    path,
    geodesic: true,
    strokeColor: "#D1D5DB",
    strokeOpacity: 0,
    strokeWeight: 4,
    icons: [
      {
        icon: { path: "M 0,-1 0,1", strokeOpacity: 0.7, scale: 3 },
        offset: "0",
        repeat: "14px",
      },
    ],
    map: m,
  });

  // Filled portion — orange
  if (progress > 0) {
    const cutIndex = Math.floor(path.length * progress);
    const filledPath = path.slice(0, Math.max(cutIndex, 2));
    const filledLine = new G.Polyline({
      path: filledPath,
      geodesic: true,
      strokeColor: progress >= 1 ? "#22C55E" : "#E85D04",
      strokeOpacity: 1,
      strokeWeight: 5,
      map: m,
    });
    return [fullLine, filledLine];
  }
  return [fullLine];
}

function fitMap(m: GMMap, G: GoogleMapsNamespace, a: Coords, b: Coords) {
  const bounds = new G.LatLngBounds();
  bounds.extend(new G.LatLng(a.lat, a.lng));
  bounds.extend(new G.LatLng(b.lat, b.lng));
  m.fitBounds(bounds);
  setTimeout(() => {
    const z = m.getZoom();
    if (z > 16) m.setZoom(15);
  }, 200);
}
