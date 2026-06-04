export function normalizePhoneInput(value: string) {
  return value.replace(/[^\d+\-() ]/g, "").trim();
}

export function isValidPhoneNumber(value: string) {
  const digitsOnly = value.replace(/\D/g, "");
  return digitsOnly.length >= 7 && digitsOnly.length <= 15;
}
