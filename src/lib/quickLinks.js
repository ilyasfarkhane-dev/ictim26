export function normalizeQuickLink(item) {
  return {
    id: item?.id,
    title: String(item?.title ?? "").trim(),
    description: String(item?.description ?? "").trim(),
    href: String(item?.href ?? "").trim(),
    icon: item?.icon ?? "document",
  };
}

export function normalizeQuickLinks(list) {
  return (list ?? []).map(normalizeQuickLink).filter((link) => link.title);
}
