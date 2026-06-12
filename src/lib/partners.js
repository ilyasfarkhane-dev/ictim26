/** Normalize partner/sponsor (legacy rows default to enabled). */
export function normalizePartner(item) {
  return {
    id: item.id,
    name: item.name ?? "",
    logo: item.logo ?? "",
    enabled: item.enabled !== false,
  };
}

export function normalizePartners(list) {
  return (list ?? []).map(normalizePartner);
}

export function isPartnerEnabled(item) {
  return item?.enabled !== false;
}

/** Partners shown on the public sponsors section. */
export function getVisiblePartners(list) {
  return normalizePartners(list).filter((p) => p.enabled);
}
