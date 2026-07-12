"use client";

import { useEffect, useRef, useState } from "react";
import { AlertCircle, Check, LocateFixed, MapPin, Search, X } from "lucide-react";
import type { Coords } from "@/lib/location";

export type StoredDeliveryLocation = Coords & {
  accuracyM: number | null;
  capturedAt: string;
  source: "browser_gps" | "manual_pin" | "address_geocode";
};

type Props = {
  isOpen: boolean;
  initialCoords: Coords | null;
  initialLabel: string;
  onClose: () => void;
  onSave: (location: StoredDeliveryLocation, label: string) => void;
};

type GMLatLng = { lat(): number; lng(): number };
type GMMap = {
  setCenter(position: Coords): void;
  setZoom(zoom: number): void;
};
type GMMarker = {
  setMap(map: GMMap | null): void;
  setPosition(position: Coords): void;
};

type GoogleMapsNamespace = {
  Map: new (el: HTMLElement, opts: object) => GMMap;
  Marker: new (opts: object) => GMMarker;
  LatLng: new (lat: number, lng: number) => GMLatLng;
};

function getGoogleMaps() {
  return (window as unknown as { google?: { maps: GoogleMapsNamespace } }).google?.maps;
}

const DEOGHAR_CENTER = { lat: 24.482, lng: 86.699 };

function loadGoogleMaps(key: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (getGoogleMaps()) {
      resolve();
      return;
    }
    const existing = document.querySelector("script[data-gm]");
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("Could not load map.")), { once: true });
      return;
    }
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}`;
    script.async = true;
    script.defer = true;
    script.dataset.gm = "1";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Could not load map."));
    document.head.appendChild(script);
  });
}

async function geocodeAddress(address: string): Promise<{ coords: Coords; label: string } | null> {
  const response = await fetch(`/api/geocode?address=${encodeURIComponent(address)}`);
  if (!response.ok) return null;
  const payload = await response.json() as { lat?: number; lng?: number; formatted?: string };
  if (typeof payload.lat !== "number" || typeof payload.lng !== "number") return null;
  return {
    coords: { lat: payload.lat, lng: payload.lng },
    label: payload.formatted || address,
  };
}

export function LocationPickerModal({ isOpen, initialCoords, initialLabel, onClose, onSave }: Props) {
  const mapElRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<GMMap | null>(null);
  const markerRef = useRef<GMMarker | null>(null);
  const [label, setLabel] = useState(initialLabel || "Deoghar, Jharkhand");
  const [addressQuery, setAddressQuery] = useState(initialLabel || "");
  const [pin, setPin] = useState<Coords | null>(initialCoords);
  const [pinSource, setPinSource] = useState<StoredDeliveryLocation["source"]>("manual_pin");
  const [mapReady, setMapReady] = useState(false);
  const [loadingMap, setLoadingMap] = useState(false);
  const [savingGps, setSavingGps] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setLabel(initialLabel || "Deoghar, Jharkhand");
    setAddressQuery(initialLabel || "");
    setPin(initialCoords);
    setPinSource(initialCoords ? "manual_pin" : "address_geocode");
    setError("");
  }, [initialCoords, initialLabel, isOpen]);

  useEffect(() => {
    if (!isOpen || !mapElRef.current) return;
    const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;
    if (!key) {
      setMapReady(false);
      return;
    }

    let cancelled = false;
    setLoadingMap(true);

    loadGoogleMaps(key)
      .then(() => {
        const G = getGoogleMaps();
        if (cancelled || !mapElRef.current || !G) return;
        const center = initialCoords ?? DEOGHAR_CENTER;
        const map = new G.Map(mapElRef.current, {
          center,
          zoom: initialCoords ? 16 : 13,
          disableDefaultUI: true,
          gestureHandling: "greedy",
          mapTypeId: "roadmap",
        });
        const marker = new G.Marker({
          position: center,
          map,
          draggable: true,
          title: "Delivery pin",
        });

        markerRef.current = marker;
        mapRef.current = map;
        setMapReady(true);

        mapElRef.current.addEventListener("click", () => setError(""));
        const setDroppedPin = (coords: Coords) => {
          setPin(coords);
          setPinSource("manual_pin");
          setLabel("Dropped pin, Deoghar");
          marker.setPosition(coords);
        };

        // Google Maps listeners exist at runtime; keep the type shim small.
        const mapsAny = G as unknown as {
          event: {
            addListener(target: object, eventName: string, cb: (event: { latLng?: GMLatLng }) => void): void;
          };
        };
        mapsAny.event.addListener(map, "click", (event) => {
          if (!event.latLng) return;
          setDroppedPin({ lat: event.latLng.lat(), lng: event.latLng.lng() });
        });
        mapsAny.event.addListener(marker, "dragend", (event) => {
          if (!event.latLng) return;
          setDroppedPin({ lat: event.latLng.lat(), lng: event.latLng.lng() });
        });
      })
      .catch(() => setError("Map could not load. Search your address instead."))
      .finally(() => {
        if (!cancelled) setLoadingMap(false);
      });

    return () => {
      cancelled = true;
      markerRef.current?.setMap(null);
      markerRef.current = null;
      mapRef.current = null;
      setMapReady(false);
    };
  }, [initialCoords, isOpen]);

  if (!isOpen) return null;

  function savePin(source: StoredDeliveryLocation["source"], coords = pin, nextLabel = label) {
    if (!coords) {
      setError("Drop a pin or search your address first.");
      return;
    }
    onSave({
      lat: coords.lat,
      lng: coords.lng,
      accuracyM: source === "manual_pin" || source === "address_geocode" ? null : 0,
      capturedAt: new Date().toISOString(),
      source,
    }, nextLabel.trim() || "Delivery pin, Deoghar");
    onClose();
  }

  async function useCurrentLocation() {
    setError("");
    if (!("geolocation" in navigator)) {
      setError("Location is not supported on this device.");
      return;
    }
    setSavingGps(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setSavingGps(false);
        const coords = { lat: position.coords.latitude, lng: position.coords.longitude };
        const nextLabel = "Current location, Deoghar";
        setPin(coords);
        setLabel(nextLabel);
        mapRef.current?.setCenter(coords);
        mapRef.current?.setZoom(16);
        markerRef.current?.setPosition(coords);
        onSave({
          ...coords,
          accuracyM: position.coords.accuracy ?? null,
          capturedAt: new Date(position.timestamp || Date.now()).toISOString(),
          source: "browser_gps",
        }, nextLabel);
        onClose();
      },
      (geoError) => {
        setSavingGps(false);
        setError(
          geoError.code === geoError.PERMISSION_DENIED
            ? "Safari blocked location. Allow it in iPhone Settings > Safari > Location, or drop your pin manually."
            : "Could not fetch location. Drop your pin manually.",
        );
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 },
    );
  }

  async function searchAddress() {
    const query = addressQuery.trim();
    if (!query) {
      setError("Type your area, street, or landmark.");
      return;
    }
    setSearching(true);
    setError("");
    try {
        const result = await geocodeAddress(query);
        if (!result) throw new Error("Address not found.");
        setPin(result.coords);
        setPinSource("address_geocode");
        setLabel(result.label);
      mapRef.current?.setCenter(result.coords);
      mapRef.current?.setZoom(16);
      markerRef.current?.setPosition(result.coords);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Address not found.");
    } finally {
      setSearching(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[10020] bg-black/55 px-3 py-4">
      <div className="mx-auto flex h-full max-w-md flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
          <div>
            <p className="text-[15px] font-extrabold text-gray-950">Set delivery location</p>
            <p className="text-[11px] font-semibold text-gray-500">Use GPS or drop your pin manually</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-full bg-gray-100 p-2 text-gray-500">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3 overflow-y-auto p-4">
          <button
            type="button"
            onClick={useCurrentLocation}
            disabled={savingGps}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-orange px-4 py-3 text-[13px] font-extrabold text-white shadow-md shadow-brand-orange/20 disabled:opacity-70"
          >
            <LocateFixed className="h-4 w-4" />
            {savingGps ? "Checking permission..." : "Use current location"}
          </button>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                value={addressQuery}
                onChange={(event) => setAddressQuery(event.target.value)}
                placeholder="Search area / landmark"
                className="w-full rounded-2xl border border-gray-200 py-3 pl-9 pr-3 text-[14px] outline-none focus:border-brand-orange"
              />
            </div>
            <button
              type="button"
              onClick={searchAddress}
              disabled={searching}
              className="rounded-2xl border border-gray-200 px-4 text-[12px] font-extrabold text-gray-700 disabled:opacity-60"
            >
              {searching ? "..." : "Find"}
            </button>
          </div>

          <div className="overflow-hidden rounded-3xl border border-gray-200 bg-gray-100">
            <div ref={mapElRef} className="h-[280px] w-full" />
            {!mapReady && (
              <div className="flex min-h-[160px] flex-col items-center justify-center gap-2 px-6 py-8 text-center">
                <MapPin className="h-8 w-8 text-brand-orange" />
                <p className="text-[13px] font-bold text-gray-800">
                  {loadingMap ? "Loading map..." : "Map unavailable"}
                </p>
                <p className="text-[11px] text-gray-500">
                  Search your address above, then save the pin.
                </p>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-orange-100 bg-orange-50 px-4 py-3">
            <p className="text-[11px] font-bold uppercase tracking-wider text-orange-700">Selected</p>
            <p className="mt-1 text-[13px] font-semibold text-orange-950">{pin ? label : "No pin selected"}</p>
            {pin && (
              <p className="mt-0.5 text-[11px] text-orange-700">
                {pin.lat.toFixed(5)}, {pin.lng.toFixed(5)}
              </p>
            )}
          </div>

          {error && (
            <p className="flex gap-2 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-[12px] font-semibold text-red-600">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {error}
            </p>
          )}
        </div>

        <div className="border-t border-gray-100 p-4">
          <button
            type="button"
            onClick={() => savePin(pinSource)}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gray-950 px-4 py-3.5 text-[14px] font-extrabold text-white disabled:opacity-50"
            disabled={!pin}
          >
            <Check className="h-4 w-4" />
            Save delivery pin
          </button>
        </div>
      </div>
    </div>
  );
}
