/** Normalize workshop (legacy rows default to enabled). */
export function normalizeWorkshop(item) {
  return {
    id: item.id,
    number: item.number ?? 0,
    title: item.title ?? "",
    subtitle: item.subtitle ?? "",
    description: item.description ?? "",
    facilitator: {
      name: item.facilitator?.name ?? "",
      credentials: item.facilitator?.credentials ?? "",
    },
    objectives: Array.isArray(item.objectives) ? item.objectives : [],
    duration: item.duration ?? "",
    price: Number(item.price ?? 0),
    currency: item.currency ?? "DH",
    image: item.image ?? "",
    enabled: item.enabled !== false,
  };
}

export function normalizeWorkshops(list) {
  return (list ?? []).map(normalizeWorkshop);
}

export function isWorkshopEnabled(item) {
  return item?.enabled !== false;
}

/** Workshops shown on the public registration page. */
export function getVisibleWorkshops(list) {
  return normalizeWorkshops(list).filter((w) => w.enabled);
}
