/** Vite base path, e.g. `/ictim26/` */
export const baseUrl = import.meta.env.BASE_URL;

/** React Router basename without trailing slash, e.g. `/ictim26` */
export const routerBasename = baseUrl.replace(/\/$/, "") || "/ictim26";

/** Build a path prefixed with the app base URL. */
export function withBase(path = "/") {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const base = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  if (!base || base === "/") return normalized;
  return `${base}${normalized}`;
}
