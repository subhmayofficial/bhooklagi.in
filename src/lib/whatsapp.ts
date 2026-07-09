export const WHATSAPP_NUMBER = "919296834048";
export const WHATSAPP_DISPLAY = "+91 92968 34048";
export const WHATSAPP_ORDER_MESSAGE = "Hi Bhook Lagi! I'd like to order food. 🍔";

export function getWhatsAppLink(message: string = WHATSAPP_ORDER_MESSAGE): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
