import type { CartLine } from "@/stores/cart-store";

export function computeOrderTotals(lines: CartLine[]) {
  const subtotal = lines.reduce((s, l) => s + l.unitPrice * l.qty, 0);
  const deliveryFee = subtotal >= 299 ? 0 : 49;
  const gst = Math.round(subtotal * 0.05);
  const grandTotal = subtotal + deliveryFee + gst;
  return { subtotal, deliveryFee, gst, grandTotal };
}
