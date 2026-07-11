export const ORDER_STATUSES = [
  "placed",
  "preparing",
  "out_for_delivery",
  "delivered",
  "cancelled",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export type OrderStatusMeta = {
  label: string;
  emoji: string;
  /** Tailwind classes for a status pill (bg + text). */
  pill: string;
  /** Short line shown to the customer on the tracking page. */
  customerLine: string;
};

export const ORDER_STATUS_META: Record<OrderStatus, OrderStatusMeta> = {
  placed: {
    label: "Placed",
    emoji: "🧾",
    pill: "bg-blue-50 text-blue-600",
    customerLine: "Order received — waiting for the kitchen to accept.",
  },
  preparing: {
    label: "Preparing",
    emoji: "👨‍🍳",
    pill: "bg-amber-50 text-amber-600",
    customerLine: "Your food is being freshly prepared.",
  },
  out_for_delivery: {
    label: "Out for delivery",
    emoji: "🛵",
    pill: "bg-orange-50 text-brand-orange",
    customerLine: "On the way! The rider will call you on arrival.",
  },
  delivered: {
    label: "Delivered",
    emoji: "✅",
    pill: "bg-green-50 text-green-600",
    customerLine: "Delivered. Enjoy your meal! 🎉",
  },
  cancelled: {
    label: "Cancelled",
    emoji: "✖️",
    pill: "bg-red-50 text-red-500",
    customerLine: "This order was cancelled.",
  },
};

/** Forward-only progression the kitchen can move an order through. */
export const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  placed: "preparing",
  preparing: "out_for_delivery",
  out_for_delivery: "delivered",
};

export function isOrderStatus(value: unknown): value is OrderStatus {
  return typeof value === "string" && (ORDER_STATUSES as readonly string[]).includes(value);
}

export type OrderLine = {
  itemId: string;
  name: string;
  unitPrice: number;
  qty: number;
  emoji: string;
  image?: string;
  diet?: string;
};

export type OrderRecord = {
  id: string;
  orderNumber: string;
  items: OrderLine[];
  status: OrderStatus;
  paymentMode: string;
  paymentStatus: string;
  deliveryName: string;
  deliveryPhone: string;
  deliveryAddress: string;
  deliveryLandmark: string | null;
  deliveryLat: number | null;
  deliveryLng: number | null;
  deliveryAccuracyM: number | null;
  deliveryLocationSource: string | null;
  deliveryLocationCapturedAt: string | null;
  subtotal: number;
  deliveryFee: number;
  gst: number;
  grandTotal: number;
  createdAt: string;
};
