const EMAIL = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

export function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function assetSrc(path) {
  if (typeof path !== "string") return "";
  if (path.startsWith("/images/") || path.startsWith("/video/")) return path;
  return "";
}

export function mailtoHref(email) {
  if (typeof email !== "string" || !EMAIL.test(email)) return undefined;
  return `mailto:${email}`;
}

export function httpsHref(url) {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return undefined;
    return parsed.href;
  } catch {
    return undefined;
  }
}

export function slugId(value) {
  if (typeof value !== "string") return "";
  return value.replace(/[^a-z0-9-]/gi, "");
}
