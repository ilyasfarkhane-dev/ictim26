/** Normalize speaker (legacy rows default to enabled). */
export function normalizeSpeaker(s) {
  return {
    id: s.id,
    name: s.name ?? "",
    position: s.position ?? "",
    company: s.company ?? "",
    bio: s.bio ?? "",
    image: s.image ?? "",
    enabled: s.enabled !== false,
  };
}

export function normalizeSpeakers(list) {
  return (list ?? []).map(normalizeSpeaker);
}

export function isSpeakerEnabled(s) {
  return s?.enabled !== false;
}

/** Speakers shown on the public site. */
export function getVisibleSpeakers(list) {
  return normalizeSpeakers(list).filter((s) => s.enabled);
}
