import { heroSponsors as defaultHeroSponsors } from "../data/heroSponsors";

function trimText(value) {
  return String(value ?? "").trim();
}

export function normalizeHeroSponsor(raw, index, fallback) {
  const fb = fallback ?? {};
  return {
    id: raw?.id ?? fb.id ?? `sponsor-${index + 1}`,
    name: trimText(raw?.name) || trimText(fb.name) || `Publisher ${index + 1}`,
    logoUrl: trimText(raw?.logoUrl) || trimText(fb.logoUrl),
    enabled: raw?.enabled !== false,
  };
}

export function normalizeHeroSponsors(list, fallback) {
  const fb = Array.isArray(fallback) ? fallback : defaultHeroSponsors;
  const src = Array.isArray(list) ? list : fb;
  return src
    .map((item, index) => normalizeHeroSponsor(item, index, fb[index]))
    .filter((s) => s.logoUrl);
}

export function getVisibleHeroSponsors(list) {
  return normalizeHeroSponsors(list).filter((s) => s.enabled !== false && s.logoUrl);
}

export function isSponsorEnabled(sponsor) {
  return sponsor?.enabled !== false;
}

export function prepareHeroSponsorsForSave(list) {
  return (list ?? [])
    .map((item, index) => normalizeHeroSponsor(item, index))
    .filter((s) => s.logoUrl)
    .map(({ id, name, logoUrl, enabled }) => ({
      id,
      name,
      logoUrl,
      enabled,
    }));
}

export function hydrateHeroSponsorsForEdit(raw) {
  const fb = defaultHeroSponsors;
  const src = Array.isArray(raw) ? raw : fb;
  return src.map((item, index) => ({
    id: item?.id ?? `sponsor-${index + 1}`,
    name: item?.name ?? "",
    logoUrl: item?.logoUrl ?? "",
    enabled: item?.enabled !== false,
  }));
}

export function emptyHeroSponsor(index = 0) {
  return {
    id: `sponsor-${Date.now()}-${index}`,
    name: "",
    logoUrl: "",
    enabled: true,
  };
}
