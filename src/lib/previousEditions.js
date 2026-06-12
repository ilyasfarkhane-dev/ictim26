import { editionsDropdown as defaultEditionsDropdown } from "../data/conference";

export const DEFAULT_EDITIONS_LABEL = "Previous Editions";

function trimText(value) {
  return String(value ?? "").trim();
}

function normalizeItem(raw, index, fallback) {
  const fb = fallback ?? {};
  const label = trimText(raw?.label ?? raw?.name) || trimText(fb.label ?? fb.name);
  if (!label) return null;

  return {
    id: raw?.id ?? fb.id ?? `edition-${index + 1}`,
    label,
    subtitle: trimText(raw?.subtitle ?? raw?.category) || trimText(fb.subtitle ?? fb.category),
    href: trimText(raw?.href) || trimText(fb.href) || "#",
    enabled: raw?.enabled !== false,
  };
}

function itemsFromLegacyArray(list) {
  if (!Array.isArray(list)) return [];
  return list
    .map((item, index) =>
      normalizeItem(
        {
          id: item?.id != null ? String(item.id) : undefined,
          label: item?.name,
          subtitle: item?.category,
          href: item?.href,
          enabled: item?.enabled,
        },
        index
      )
    )
    .filter(Boolean);
}

function defaultItems() {
  return (defaultEditionsDropdown.items ?? []).map((item, index) =>
    normalizeItem(item, index)
  ).filter(Boolean);
}

export function emptyEditionItem(index = 0) {
  return {
    id: `edition-${Date.now()}-${index}`,
    label: "",
    subtitle: "",
    href: "https://www.conference-tim.com/",
    enabled: true,
  };
}

export function normalizeEditionsDropdown(data, fallback) {
  const fb = fallback ?? defaultEditionsDropdown;
  const src = data && typeof data === "object" ? data : {};

  let items = [];
  if (Array.isArray(src.items) && src.items.length) {
    items = src.items.map((item, index) => normalizeItem(item, index, fb.items?.[index])).filter(Boolean);
  } else if (Array.isArray(src)) {
    items = itemsFromLegacyArray(src);
  } else if (Array.isArray(fb.items) && fb.items.length) {
    items = fb.items.map((item, index) => normalizeItem(item, index)).filter(Boolean);
  } else {
    items = defaultItems();
  }

  return {
    label: trimText(src.label) || trimText(fb.label) || DEFAULT_EDITIONS_LABEL,
    items,
  };
}

export function getVisibleEditionItems(items) {
  return (items ?? []).filter((item) => item && item.enabled !== false && item.label?.trim());
}

export function getPublicEditionsDropdown(dropdown) {
  const normalized = normalizeEditionsDropdown(dropdown);
  return {
    label: normalized.label,
    items: getVisibleEditionItems(normalized.items).map(({ label, subtitle, href, id }) => ({
      id,
      label,
      subtitle,
      href,
    })),
  };
}

export function prepareEditionsDropdownForSave(dropdown) {
  const normalized = normalizeEditionsDropdown(dropdown);
  return {
    label: normalized.label,
    items: normalized.items.map(({ id, label, subtitle, href, enabled }) => ({
      id,
      label,
      subtitle,
      href,
      enabled,
    })),
  };
}

export function hydrateEditionsDropdownForEdit(raw) {
  return normalizeEditionsDropdown(raw);
}
