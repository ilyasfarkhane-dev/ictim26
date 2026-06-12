import { withBase } from "../config/paths";

/** Normalize legacy hero_images shapes (main/right/secondary) to a single image. */
export function normalizeHeroImage(heroImages) {
  if (!heroImages) return { src: "", alt: "" };
  if (heroImages.src) {
    return { src: heroImages.src, alt: heroImages.alt ?? "" };
  }
  if (heroImages.right?.src) return heroImages.right;
  if (heroImages.main?.src) return heroImages.main;
  if (heroImages.secondary?.[0]?.src) return heroImages.secondary[0];
  return { src: "", alt: "" };
}

const LEGACY_HERO_FOREGROUND = "/assets/hero.png";

export const DEFAULT_HERO_ALT =
  "ICTIM conference venue — information technology and modeling";

/** Pick the hero background path (local asset or external URL). No default image. */
export function resolveHeroBackgroundPath(src) {
  const path = String(src ?? "").trim();
  if (!path) return "";
  if (path === LEGACY_HERO_FOREGROUND || path.endsWith("/assets/hero.png")) {
    return "";
  }
  return path;
}

/** Resolve local public paths with the Vite base URL; pass through external URLs. */
export function resolveHeroSrc(src) {
  const path = resolveHeroBackgroundPath(src);
  if (!path) return "";
  if (path.startsWith("/")) return withBase(path);
  return path;
}
