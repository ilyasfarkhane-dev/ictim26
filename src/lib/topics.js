/** Normalize topic (legacy rows default to enabled). */
export function normalizeTopic(t) {
  return {
    id: t.id,
    name: t.name ?? "",
    enabled: t.enabled !== false,
  };
}

export function normalizeTopics(list) {
  return (list ?? []).map(normalizeTopic);
}

export function isTopicEnabled(t) {
  return t?.enabled !== false;
}

/** Topics shown on the public site. */
export function getVisibleTopics(list) {
  return normalizeTopics(list).filter((t) => t.enabled);
}
