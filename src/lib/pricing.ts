import type { CartLine } from "@/stores/cart-store";
import { menuItems } from "@/data/menu";
import type { SupabaseClient } from "@supabase/supabase-js";

type StoreSettings = { delivery_charge: number; free_delivery_threshold: number; tax_percent: number; upi_discount_enabled: boolean; upi_discount_percent: number; };

export function computeOrderTotals(lines: CartLine[], settings: StoreSettings) {
  const subtotal = lines.reduce((s, l) => s + l.unitPrice * l.qty, 0);
  const deliveryFee = subtotal >= settings.free_delivery_threshold || subtotal === 0 ? 0 : settings.delivery_charge;
  const gst = Math.round(subtotal * (settings.tax_percent / 100));
  const grandTotal = subtotal + deliveryFee + gst;
  return { subtotal, deliveryFee, gst, grandTotal };
}

export async function computeServerOrderTotals(lines: CartLine[], supabase: SupabaseClient) {
  // 1. Fetch overrides, custom items, and store settings
  const [{ data: overrideRows }, { data: customRows }, { data: settingsData }] = await Promise.all([
    supabase.from("menu_items").select("id, price, is_available"),
    supabase.from("custom_menu_items").select("id, price, is_available, name, emoji").eq("is_available", true),
    supabase.from("store_settings").select("*").eq("id", "default").maybeSingle(),
  ]);

  const storeSettings: StoreSettings = settingsData || { delivery_charge: 49, free_delivery_threshold: 299, tax_percent: 5, upi_discount_enabled: false, upi_discount_percent: 0 };

  const overrides = new Map<string, { price?: number; isAvailable: boolean }>();
  for (const row of overrideRows ?? []) {
    overrides.set(row.id as string, {
      price: row.price as number | undefined,
      isAvailable: row.is_available as boolean,
    });
  }

  const customItems = new Map<string, { price: number; isAvailable: boolean; name: string; emoji: string }>();
  for (const row of customRows ?? []) {
    customItems.set(row.id as string, {
      price: row.price as number,
      isAvailable: row.is_available as boolean,
      name: row.name as string,
      emoji: row.emoji as string,
    });
  }

  // 2. Validate and construct verified lines
  const verifiedLines: CartLine[] = [];

  for (const line of lines) {
    let serverPrice = 0;
    let isAvailable = false;
    let serverName = line.name;
    let serverEmoji = line.emoji;

    // Check if it's a hardcoded item
    const baseItem = menuItems.find((m) => m.id === line.itemId);
    if (baseItem) {
      serverPrice = baseItem.price;
      isAvailable = true;
      serverName = baseItem.name;
      serverEmoji = baseItem.emoji;

      // Apply override if exists
      const override = overrides.get(line.itemId);
      if (override) {
        if (override.price !== undefined) serverPrice = override.price;
        isAvailable = override.isAvailable;
      }
    } else {
      // Check if it's a custom item
      const customItem = customItems.get(line.itemId);
      if (customItem) {
        serverPrice = customItem.price;
        isAvailable = customItem.isAvailable;
        serverName = customItem.name;
        serverEmoji = customItem.emoji;
      }
    }

    if (!isAvailable) {
      throw new Error(`Item ${line.name} is currently unavailable.`);
    }

    if (serverPrice <= 0) {
       throw new Error(`Invalid price for item ${line.name}.`);
    }

    verifiedLines.push({
      itemId: line.itemId,
      name: serverName,
      unitPrice: serverPrice,
      qty: line.qty,
      emoji: serverEmoji,
    });
  }

  const totals = computeOrderTotals(verifiedLines, storeSettings);
  return { verifiedLines, totals, storeSettings };
}

export async function computeFinalServerTotals(
  lines: CartLine[],
  rawCouponCode: string,
  paymentMode: string,
  supabase: SupabaseClient
) {
  const { verifiedLines, totals, storeSettings } = await computeServerOrderTotals(lines, supabase);

  let couponCode: string | null = null;
  let couponDiscount = 0;
  let couponId: string | null = null;
  let usedCount = 0;

  if (rawCouponCode) {
    const { data: coupon } = await supabase
      .from("coupons")
      .select("id, discount_type, discount_value, min_order, payment_mode_required, max_uses, used_count")
      .eq("code", rawCouponCode)
      .eq("is_active", true)
      .maybeSingle();

    if (
      coupon &&
      (!coupon.payment_mode_required || coupon.payment_mode_required === paymentMode) &&
      totals.subtotal >= coupon.min_order &&
      (coupon.max_uses === null || coupon.used_count < coupon.max_uses)
    ) {
      couponCode = rawCouponCode;
      couponDiscount =
        coupon.discount_type === "percent"
          ? Math.round((totals.subtotal * coupon.discount_value) / 100)
          : coupon.discount_value;
      couponId = coupon.id;
      usedCount = coupon.used_count;
    }
  }

  const upiDiscount = (paymentMode === "upi" || paymentMode === "online") && storeSettings.upi_discount_enabled
    ? Math.round((totals.subtotal * storeSettings.upi_discount_percent) / 100)
    : 0;

  const finalGrandTotal = Math.max(0, totals.grandTotal - couponDiscount - upiDiscount);

  return {
    verifiedLines,
    totals,
    couponCode,
    couponDiscount,
    upiDiscount,
    couponId,
    usedCount,
    finalGrandTotal,
  };
}
