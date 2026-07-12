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
  foodRating: number | null;
  deliveryRating: number | null;
  ratingComment: string | null;
  ratedAt: string | null;
};

export type DynamicEtaResult = {
  remainingMinutes: number;
  totalAllottedMinutes: number;
  stageInfo: string;
};

export function computeDynamicEta(
  orderStatus: OrderStatus,
  createdAt: string,
  events: { status: string; created_at: string }[],
  baseMaxEta: number = 25,
  nowMs: number = Date.now()
): DynamicEtaResult {
  if (orderStatus === "delivered" || orderStatus === "cancelled") {
    return {
      remainingMinutes: 0,
      totalAllottedMinutes: baseMaxEta,
      stageInfo: orderStatus === "delivered" ? "Delivered" : "Cancelled",
    };
  }

  // Stage split allotments (e.g., if baseMaxEta is 25: Accept=5m, Prep=10m, Delivery=10m)
  const acceptWindow = 5;
  const prepWindow = 10;
  const deliveryWindow = Math.max(10, baseMaxEta - acceptWindow - prepWindow);

  const createdTime = new Date(createdAt).getTime();
  const elapsedSinceCreated = Math.max(0, (nowMs - createdTime) / 60000);

  if (orderStatus === "placed") {
    // Stage 1: Waiting for kitchen to accept
    if (elapsedSinceCreated <= acceptWindow) {
      return {
        remainingMinutes: Math.ceil(baseMaxEta - elapsedSinceCreated),
        totalAllottedMinutes: baseMaxEta,
        stageInfo: "Waiting for kitchen acceptance",
      };
    }
    // If kitchen acceptance takes longer, ensure remaining minutes still cover prep + delivery
    const extendedTotal = Math.ceil(elapsedSinceCreated + prepWindow + deliveryWindow);
    return {
      remainingMinutes: prepWindow + deliveryWindow,
      totalAllottedMinutes: extendedTotal,
      stageInfo: "Kitchen review in progress",
    };
  }

  if (orderStatus === "preparing") {
    // Stage 2: Kitchen preparing food
    const prepEvent = events.find((e) => e.status === "preparing");
    const prepStartTime = prepEvent ? new Date(prepEvent.created_at).getTime() : (createdTime + acceptWindow * 60000);
    const elapsedSincePrep = Math.max(0, (nowMs - prepStartTime) / 60000);

    if (elapsedSincePrep <= prepWindow) {
      const remainingPrep = prepWindow - elapsedSincePrep;
      return {
        remainingMinutes: Math.ceil(remainingPrep + deliveryWindow),
        totalAllottedMinutes: Math.max(baseMaxEta, Math.ceil((prepStartTime - createdTime) / 60000 + prepWindow + deliveryWindow)),
        stageInfo: "Kitchen preparing your meal",
      };
    }
    // If food preparation takes extra time, floor remaining at delivery window + buffer
    const extraPrepElapsed = elapsedSincePrep - prepWindow;
    const dynamicRemaining = deliveryWindow + 2;
    const dynamicTotal = Math.ceil(baseMaxEta + extraPrepElapsed + 2);
    return {
      remainingMinutes: dynamicRemaining,
      totalAllottedMinutes: dynamicTotal,
      stageInfo: "Final touches in kitchen before dispatch",
    };
  }

  if (orderStatus === "out_for_delivery") {
    // Stage 3: Rider delivering
    const outEvent = events.find((e) => e.status === "out_for_delivery");
    const outStartTime = outEvent ? new Date(outEvent.created_at).getTime() : (nowMs - 2 * 60000);
    const elapsedSinceOut = Math.max(0, (nowMs - outStartTime) / 60000);

    const remainingDelivery = Math.max(1, Math.ceil(deliveryWindow - elapsedSinceOut));
    const actualTotalElapsed = Math.ceil((nowMs - createdTime) / 60000);
    return {
      remainingMinutes: remainingDelivery,
      totalAllottedMinutes: Math.max(baseMaxEta, actualTotalElapsed + remainingDelivery),
      stageInfo: "Rider heading to your exact pin",
    };
  }

  return {
    remainingMinutes: Math.max(1, Math.ceil(baseMaxEta - elapsedSinceCreated)),
    totalAllottedMinutes: baseMaxEta,
    stageInfo: "Processing order",
  };
}
