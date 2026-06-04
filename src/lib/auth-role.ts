const adminEmail =
  process.env.NEXT_PUBLIC_ADMIN_EMAIL?.trim().toLowerCase() ??
  "murtaza.sanwala@admin.local";

export function isAdminEmail(email?: string | null) {
  return (email ?? "").trim().toLowerCase() === adminEmail;
}
