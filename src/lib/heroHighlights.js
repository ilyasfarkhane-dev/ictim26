/** Normalize a hero highlight stat (legacy items default to enabled). */
export function normalizeHeroHighlight(h) {
  return {
    value: h?.value ?? "",
    label: h?.label ?? "",
    enabled: h?.enabled !== false,
  };
}

export function normalizeHeroHighlights(list) {
  return (list ?? []).map(normalizeHeroHighlight);
}

/** Stats shown on the public homepage. */
export function getVisibleHeroHighlights(list) {
  return normalizeHeroHighlights(list).filter((h) => h.enabled);
}

export function isHighlightEnabled(h) {
  return h?.enabled !== false;
}
