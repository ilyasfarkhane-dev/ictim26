import { committees as defaultCommittees } from "../data/committees";

function slugId(prefix, index) {
  return `${prefix}-${index + 1}`;
}

function normalizeMember(raw, index, prefix = "member") {
  if (!raw || typeof raw !== "object") return null;
  const name = String(raw.name ?? "").trim();
  if (!name) return null;
  return {
    id: raw.id ?? slugId(prefix, index),
    name,
    affiliation: String(raw.affiliation ?? "").trim(),
    email: String(raw.email ?? "").trim(),
    enabled: raw.enabled !== false,
  };
}

function normalizeMemberList(list, prefix) {
  if (!Array.isArray(list)) return [];
  return list.map((item, i) => normalizeMember(item, i, prefix)).filter(Boolean);
}

function dedupeMembersByName(list) {
  const seen = new Set();
  const unique = [];
  for (const item of list ?? []) {
    const key = String(item?.name ?? "")
      .trim()
      .toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    unique.push(item);
  }
  return unique;
}

function hasNewCommitteeShape(data) {
  return Boolean(
    data &&
      typeof data === "object" &&
      (Array.isArray(data.organizingSenior) ||
        Array.isArray(data.organizingJuniors) ||
        Array.isArray(data.scientific))
  );
}

/** Map legacy programChairs / externalReviewers / organizing keys to the new structure. */
function migrateLegacyCommittees(data, fallback) {
  const fb = fallback ?? defaultCommittees;

  const organizingSenior = normalizeMemberList(
    data.organizing?.programChairs?.length
      ? data.organizing.programChairs
      : data.programChairs?.length
        ? data.programChairs
        : fb.organizingSenior,
    "org-sr"
  );

  const scientificSource = dedupeMembersByName([
    ...(data.programChairs ?? []),
    ...(data.externalReviewers ?? []),
    ...(data.scientific ?? []),
  ]);

  return {
    organizingSenior: organizingSenior.length ? organizingSenior : normalizeMemberList(fb.organizingSenior, "org-sr"),
    organizingJuniors: normalizeMemberList(
      data.organizingJuniors?.length ? data.organizingJuniors : fb.organizingJuniors,
      "org-jr"
    ),
    scientific: scientificSource.length
      ? normalizeMemberList(scientificSource, "sci")
      : normalizeMemberList(fb.scientific, "sci"),
  };
}

export function normalizeCommittees(data, fallback) {
  const fb = fallback ?? defaultCommittees;

  if (!data || typeof data !== "object") {
    return {
      organizingSenior: normalizeMemberList(fb.organizingSenior, "org-sr"),
      organizingJuniors: normalizeMemberList(fb.organizingJuniors, "org-jr"),
      scientific: normalizeMemberList(fb.scientific, "sci"),
    };
  }

  if (!hasNewCommitteeShape(data)) {
    return migrateLegacyCommittees(data, fb);
  }

  return {
    organizingSenior: normalizeMemberList(
      data.organizingSenior?.length ? data.organizingSenior : fb.organizingSenior,
      "org-sr"
    ),
    organizingJuniors: normalizeMemberList(
      data.organizingJuniors?.length ? data.organizingJuniors : fb.organizingJuniors,
      "org-jr"
    ),
    scientific: normalizeMemberList(
      data.scientific?.length ? data.scientific : fb.scientific,
      "sci"
    ),
  };
}

export function getVisibleMembers(members) {
  return (members ?? []).filter((m) => m && m.enabled !== false);
}

export function emptyMember(prefix = "member") {
  return {
    id: `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: "",
    affiliation: "",
    email: "",
    enabled: true,
  };
}

export function prepareCommitteesForSave(form) {
  const normalized = normalizeCommittees(form);
  const stripMember = (members) =>
    members.map(({ id, name, affiliation, email, enabled }) => ({
      id,
      name,
      affiliation,
      ...(email ? { email } : {}),
      enabled,
    }));

  return {
    organizingSenior: stripMember(normalized.organizingSenior),
    organizingJuniors: stripMember(normalized.organizingJuniors),
    scientific: stripMember(normalized.scientific),
  };
}

export function hydrateCommitteesForEdit(raw) {
  const data = normalizeCommittees(raw);
  return {
    organizingSenior: data.organizingSenior,
    organizingJuniors: data.organizingJuniors,
    scientific: data.scientific,
  };
}

export function memberInitial(name) {
  const cleaned = String(name ?? "")
    .replace(/^(Prof\.|Dr\.|Pr\.)\s*/i, "")
    .trim();
  return cleaned.charAt(0) || "?";
}
