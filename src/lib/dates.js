/** Normalize important date (legacy rows default to enabled). */
export function normalizeDate(item) {
  return {
    id: item.id,
    step: item.step ?? "",
    title: item.title ?? "",
    date: item.date ?? "",
    description: item.description ?? "",
    icon: item.icon ?? "calendar",
    image: item.image ?? "",
    enabled: item.enabled !== false,
  };
}

export function normalizeDates(list) {
  return (list ?? []).map(normalizeDate);
}

export function isDateEnabled(item) {
  return item?.enabled !== false;
}

/** Milestones shown on the public site. */
export function getVisibleDates(list) {
  return normalizeDates(list).filter((d) => d.enabled);
}
