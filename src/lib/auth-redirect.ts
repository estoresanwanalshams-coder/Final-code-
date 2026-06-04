export function getSafeRedirectPath(redirect: string | null | undefined) {
  if (!redirect) {
    return "/";
  }

  const trimmed = redirect.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) {
    return "/";
  }

  return trimmed;
}

export function buildAuthHref(path: "/login" | "/register", redirectTo: string) {
  const safeRedirect = getSafeRedirectPath(redirectTo);
  if (safeRedirect === "/") {
    return path;
  }

  return `${path}?redirect=${encodeURIComponent(safeRedirect)}`;
}
