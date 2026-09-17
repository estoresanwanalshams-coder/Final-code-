const CANONICAL_ADMIN_EMAIL = "murtaza.sanwala@admin.local";
const LEGACY_ADMIN_EMAIL = "murtaza.sanwala@admin.locals";

const configuredAdminEmail =
  process.env.NEXT_PUBLIC_ADMIN_EMAIL?.trim().toLowerCase() || undefined;

export const adminEmails = Array.from(
  new Set(
    [CANONICAL_ADMIN_EMAIL, configuredAdminEmail, LEGACY_ADMIN_EMAIL].filter(
      (email): email is string => Boolean(email),
    ),
  ),
);

export function getAdminEmail() {
  if (configuredAdminEmail && configuredAdminEmail !== LEGACY_ADMIN_EMAIL) {
    return configuredAdminEmail;
  }

  return CANONICAL_ADMIN_EMAIL;
}

export function getAdminLoginEmails() {
  return adminEmails;
}

export function isAdminEmail(email?: string | null) {
  return adminEmails.includes((email ?? "").trim().toLowerCase());
}
