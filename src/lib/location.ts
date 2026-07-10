export const KITCHEN_COORDS = {
  lat: 24.479778,
  lng: 86.715833,
} as const;

export const KITCHEN_COORDS_QUERY = `${KITCHEN_COORDS.lat},${KITCHEN_COORDS.lng}`;

export type Coords = {
  lat: number;
  lng: number;
};

export function distanceKm(a: Coords, b: Coords) {
  const radiusKm = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return 2 * radiusKm * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

export function estimateDeliveryMinutes(customerCoords?: Coords | null) {
  if (!customerCoords) return { min: 25, max: 35 };
  const km = distanceKm(KITCHEN_COORDS, customerCoords);
  const travel = Math.ceil((km / 18) * 60);
  const min = clamp(18 + travel, 22, 45);
  return { min, max: min + 10 };
}

function toRad(deg: number) {
  return (deg * Math.PI) / 180;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}
