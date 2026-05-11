import type { CartLine } from "@/stores/cart-store";

export const TEST_ORDER_STORAGE_KEY = "bhooklagi-test-order";

export type DeliveryInfo = {
  name: string;
  phone: string;
  address: string;
  landmark?: string;
};

export type PaymentMode = "cod" | "online_bypassed";

export type TestOrderSnapshot = {
  orderId: string;
  placedAtIso: string;
  lines: CartLine[];
  delivery: DeliveryInfo;
  paymentMode: PaymentMode;
  subtotal: number;
  deliveryFee: number;
  gst: number;
  grand: number;
};

export function generateTestOrderId(): string {
  const t = Date.now().toString(36).toUpperCase();
  const r = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `BL-${t}-${r}`;
}

export function saveTestOrder(snapshot: TestOrderSnapshot): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(TEST_ORDER_STORAGE_KEY, JSON.stringify(snapshot));
}

export function loadTestOrder(): TestOrderSnapshot | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(TEST_ORDER_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as TestOrderSnapshot;
  } catch {
    return null;
  }
}
