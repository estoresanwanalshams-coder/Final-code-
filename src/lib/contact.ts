export const HM_WHATSAPP_NUMBER = "971562300750";
export const HM_PHONE_NUMBER = "+971562300750";
export const HM_PHONE_DISPLAY = "+971 56 230 0750";

export function buildWhatsAppUrl(message?: string) {
  if (!message) {
    return `https://wa.me/${HM_WHATSAPP_NUMBER}`;
  }

  return `https://wa.me/${HM_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}