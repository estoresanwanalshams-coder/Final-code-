const driveIdPattern = /\/file\/d\/([a-zA-Z0-9_-]+)/;

function extractGoogleDriveId(url: URL) {
  const pathMatch = url.pathname.match(driveIdPattern);
  if (pathMatch?.[1]) {
    return pathMatch[1];
  }

  const idFromQuery = url.searchParams.get("id");
  if (idFromQuery) {
    return idFromQuery;
  }

  return "";
}

export function normalizeImageUrl(rawUrl?: string) {
  const url = (rawUrl ?? "").trim();
  if (!url) {
    return "";
  }

  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.toLowerCase();
    const isGoogleDriveHost =
      hostname === "drive.google.com" || hostname === "docs.google.com";

    if (!isGoogleDriveHost) {
      return url;
    }

    const fileId = extractGoogleDriveId(parsed);
    if (!fileId) {
      return url;
    }

    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1600`;
  } catch {
    return url;
  }
}

export function normalizeImageUrls(urls: string[]) {
  return urls
    .map((item) => normalizeImageUrl(item))
    .filter(Boolean);
}
