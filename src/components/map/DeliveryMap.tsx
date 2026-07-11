"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Minus, Navigation, MapPin, Plus } from "lucide-react";
import { KITCHEN_COORDS } from "@/lib/location";

// ─── Minimal Google Maps type shims ────────────────────────────────────────
type GMLatLng = { lat(): number; lng(): number };
type GMMap = {
  fitBounds(b: object): void;
  getZoom(): number;
  panBy(x: number, y: number): void;
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
  customerCoords?: Coords | null;
  orderCreatedAt?: string;
  estimatedDeliveryMinutes?: number;
  status: Status;
};

export function DeliveryMap({ deliveryAddress, customerCoords, orderCreatedAt, estimatedDeliveryMinutes, status }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<GMMap | null>(null);
  const markersRef = useRef<GMMarker[]>([]);
  const linesRef = useRef<GMPolyline[]>([]);

  const [routeEta, setRouteEta] = useState<number | null>(null);
  const [geoError, setGeoError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(() => Date.now());

  const elapsedMinutes = orderCreatedAt ? Math.max(0, (now - new Date(orderCreatedAt).getTime()) / 60000) : 0;
  const targetMinutes = estimatedDeliveryMinutes ?? routeEta ?? 35;
  const timeProgress = targetMinutes > 0 ? elapsedMinutes / targetMinutes : 0;
  const progress =
    status === "delivered"
      ? 1
      : status === "cancelled"
        ? 0
        : Math.min(0.96, Math.max(STATUS_PROGRESS[status] ?? 0, timeProgress));
  const remainingMinutes =
    status === "delivered"
      ? 0
      : Math.max(1, Math.ceil(targetMinutes - elapsedMinutes));

  function zoomMap(delta: number) {
    const map = mapInstanceRef.current;
    if (!map) return;
    map.setZoom(map.getZoom() + delta);
  }

  function panMap(x: number, y: number) {
    mapInstanceRef.current?.panBy(x, y);
  }

  useEffect(() => {
    if (status === "cancelled" || status === "delivered") return;
    const timer = window.setInterval(() => setNow(Date.now()), 30000);
    return () => window.clearInterval(timer);
  }, [status]);

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;
    if (!key || !mapRef.current) return;

    let cancelled = false;

    async function build() {
      try {
        setLoading(true);
        setGeoError(false);
        // 1. Load Maps JS API
        await loadGoogleMaps(key!);
        if (cancelled) return;

        const kitchenCoords: Coords = KITCHEN_COORDS;

        // 2b. Customer location — prefer captured coordinates from order placement.
        const customer = customerCoords ?? await geocodeAddress(deliveryAddress);
        if (cancelled) return;

        const customerPin = customer ?? { lat: 24.4910, lng: 86.6920 };
        if (!customer) setGeoError(true);

        const G = window.google!.maps;

        // 3. Create or reuse map
        let m = mapInstanceRef.current;
        if (!m) {
          m = new G.Map(mapRef.current!, {
            center: { lat: (kitchenCoords.lat + customerPin.lat) / 2, lng: (kitchenCoords.lng + customerPin.lng) / 2 },
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
          position: { lat: customerPin.lat, lng: customerPin.lng },
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
            destination: new G.LatLng(customerPin.lat, customerPin.lng),
            travelMode: G.TravelMode.DRIVING,
          },
          (result, status) => {
            if (cancelled || !result || status !== G.DirectionsStatus.OK) {
              // Fallback: straight line
              linesRef.current = drawLines(m!, G, [
                { lat: kitchenCoords.lat, lng: kitchenCoords.lng },
                { lat: customerPin.lat, lng: customerPin.lng },
              ], progress);
              fitMap(m!, G, kitchenCoords, customerPin);
              return;
            }

            const route = result.routes[0];
            const path = route.overview_path.map((p) => ({ lat: p.lat(), lng: p.lng() }));
            const totalMinutes = Math.ceil((route.legs[0].duration.value / 60) * 1.3 + 10);
            setRouteEta(totalMinutes);

            linesRef.current = drawLines(m!, G, path, progress);
            fitMap(m!, G, kitchenCoords, customerPin);
          },
        );

        // Add rider marker for out_for_delivery
        if (status === "out_for_delivery") {
          const midLat = kitchenCoords.lat + (customerPin.lat - kitchenCoords.lat) * progress;
          const midLng = kitchenCoords.lng + (customerPin.lng - kitchenCoords.lng) * progress;
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
  }, [deliveryAddress, customerCoords?.lat, customerCoords?.lng, status, progress]);

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
          <span className="rounded-full bg-white/20 px-3 py-1 text-[12px] font-extrabold text-white">
            {remainingMinutes} min
          </span>
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
        <div className="absolute right-2 top-2 z-20 overflow-hidden rounded-xl bg-white shadow-lg ring-1 ring-black/10">
          <button
            type="button"
            aria-label="Zoom in"
            onClick={() => zoomMap(1)}
            className="flex h-9 w-9 items-center justify-center text-gray-700 active:bg-gray-100"
          >
            <Plus className="h-4 w-4" strokeWidth={3} />
          </button>
          <div className="h-px bg-gray-100" />
          <button
            type="button"
            aria-label="Zoom out"
            onClick={() => zoomMap(-1)}
            className="flex h-9 w-9 items-center justify-center text-gray-700 active:bg-gray-100"
          >
            <Minus className="h-4 w-4" strokeWidth={3} />
          </button>
        </div>
        <div className="absolute bottom-2 right-2 z-20 grid grid-cols-3 gap-1 rounded-xl bg-white/95 p-1 shadow-lg ring-1 ring-black/10">
          <span />
          <button
            type="button"
            aria-label="Move map up"
            onClick={() => panMap(0, -90)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-700 active:bg-gray-100"
          >
            <ArrowUp className="h-4 w-4" strokeWidth={3} />
          </button>
          <span />
          <button
            type="button"
            aria-label="Move map left"
            onClick={() => panMap(-90, 0)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-700 active:bg-gray-100"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={3} />
          </button>
          <div className="h-8 w-8 rounded-lg bg-brand-orange/10" />
          <button
            type="button"
            aria-label="Move map right"
            onClick={() => panMap(90, 0)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-700 active:bg-gray-100"
          >
            <ArrowRight className="h-4 w-4" strokeWidth={3} />
          </button>
          <span />
          <button
            type="button"
            aria-label="Move map down"
            onClick={() => panMap(0, 90)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-700 active:bg-gray-100"
          >
            <ArrowDown className="h-4 w-4" strokeWidth={3} />
          </button>
          <span />
        </div>
        {geoError && (
          <div className="absolute bottom-2 left-2 rounded-lg bg-amber-50 px-2 py-1 text-[10px] font-semibold text-amber-700 shadow ring-1 ring-amber-200">
            Approx. location - delivery pin unavailable
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
      {customerCoords && (
        <div className="border-t border-gray-100 bg-white px-4 py-2 text-[10px] font-semibold text-green-700">
          Delivery location ready
        </div>
      )}
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
    const filledPath = getPartialPath(path, progress);
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

function getPartialPath(path: { lat: number; lng: number }[], progress: number) {
  if (path.length <= 2) return path;
  if (progress >= 1) return path;

  const segments = path.slice(1).map((point, index) => ({
    from: path[index],
    to: point,
    length: distanceBetween(path[index], point),
  }));
  const total = segments.reduce((sum, segment) => sum + segment.length, 0);
  const target = total * progress;
  const partial = [path[0]];
  let covered = 0;

  for (const segment of segments) {
    if (covered + segment.length < target) {
      partial.push(segment.to);
      covered += segment.length;
      continue;
    }

    const ratio = segment.length === 0 ? 0 : (target - covered) / segment.length;
    partial.push({
      lat: segment.from.lat + (segment.to.lat - segment.from.lat) * ratio,
      lng: segment.from.lng + (segment.to.lng - segment.from.lng) * ratio,
    });
    break;
  }

  return partial.length > 1 ? partial : path.slice(0, 2);
}

function distanceBetween(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const lat = a.lat - b.lat;
  const lng = a.lng - b.lng;
  return Math.sqrt(lat * lat + lng * lng);
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
