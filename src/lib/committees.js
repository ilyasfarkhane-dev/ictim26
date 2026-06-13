import { committees as defaultCommittees } from "../data/committees";

/** Ordered committee groups shown on the site (before Organizing Senior). */
export const COMMITTEE_GROUPS = [
  {
    id: "honoraryChairs",
    label: "Honorary Chairs",
    shortLabel: "Honorary",
    description: "Honorary Chairs",
    prefix: "hon-ch",
    showEmail: false,
    layout: "grid",
  },
  {
    id: "conferenceChair",
    label: "Conference Chair",
    shortLabel: "Chair",
    description: "Conference Chair",
    prefix: "conf-ch",
    showEmail: true,
    layout: "grid",
  },
  {
    id: "conferenceCoChair",
    label: "Conference Co-Chair",
    shortLabel: "Co-Chair",
    description: "Conference Co-Chair",
    prefix: "conf-co-ch",
    showEmail: true,
    layout: "grid",
  },
  {
    id: "sponsorshipChairs",
    label: "Sponsorship & Exhibits Chairs",
    shortLabel: "Sponsorship",
    description: "Sponsorship & Exhibits Chairs",
    prefix: "spon-ch",
    showEmail: false,
    layout: "grid",
  },
  {
    id: "webChairs",
    label: "Web Chairs",
    shortLabel: "Web",
    description: "Web Chairs",
    prefix: "web-ch",
    showEmail: false,
    layout: "compact",
  },
  {
    id: "publicityChairs",
    label: "Publicity & Communication Chairs",
    shortLabel: "Publicity",
    description: "Publicity & Communication Chairs",
    prefix: "pub-comm-ch",
    showEmail: false,
    layout: "compact",
  },
  {
    id: "registrationChairs",
    label: "Registration Chairs",
    shortLabel: "Registration",
    description: "Registration Chairs",
    prefix: "reg-ch",
    showEmail: false,
    layout: "compact",
  },
  {
    id: "publicationChairs",
    label: "Publication Chairs",
    shortLabel: "Publication",
    description: "Publication Chairs",
    prefix: "publ-ch",
    showEmail: false,
    layout: "compact",
  },
  {
    id: "speakersSessionChairs",
    label: "Speakers Session Chairs",
    shortLabel: "Speakers",
    description: "Speakers Session Chairs",
    prefix: "spk-ch",
    showEmail: false,
    layout: "compact",
  },
  {
    id: "organizingSenior",
    label: "Organizing (Senior)",
    shortLabel: "Senior",
    description: "Organizing Committee (Senior)",
    prefix: "org-sr",
    showEmail: true,
    layout: "grid",
  },
  {
    id: "organizingJuniors",
    label: "Organizing (Juniors)",
    shortLabel: "Juniors",
    description: "Organizing Committee (Juniors)",
    prefix: "org-jr",
    showEmail: false,
    layout: "compact",
  },
  {
    id: "scientific",
    label: "Scientific Committee",
    shortLabel: "Scientific",
    description: "Scientific Committee members",
    prefix: "sci",
    showEmail: false,
    layout: "compact",
  },
];

export const COMMITTEE_GROUP_IDS = COMMITTEE_GROUPS.map((g) => g.id);

export const COMMITTEE_TAB_PREFIX = Object.fromEntries(
  COMMITTEE_GROUPS.map((g) => [g.id, g.prefix])
);

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

function defaultGroupSettings() {
  return Object.fromEntries(COMMITTEE_GROUP_IDS.map((id) => [id, { enabled: true }]));
}

function normalizeGroupSettings(raw, fallback) {
  const fb = fallback?.groupSettings ?? defaultGroupSettings();
  const source = raw?.groupSettings ?? raw ?? {};
  const settings = {};

  for (const id of COMMITTEE_GROUP_IDS) {
    const value = source[id] ?? fb[id];
    settings[id] = { enabled: value?.enabled !== false };
  }

  return settings;
}

function groupMeta(id) {
  return COMMITTEE_GROUPS.find((g) => g.id === id) ?? COMMITTEE_GROUPS[0];
}

function normalizeAllMemberLists(data, fallback) {
  const fb = fallback ?? defaultCommittees;
  const lists = {};
  const sourceData = data && typeof data === "object" ? data : {};

  for (const group of COMMITTEE_GROUPS) {
    const fbList = fb[group.id] ?? [];
    const source = sourceData[group.id];
    const list =
      Object.prototype.hasOwnProperty.call(sourceData, group.id) && Array.isArray(source)
        ? source
        : fbList;
    lists[group.id] = normalizeMemberList(list, group.prefix);
  }

  return lists;
}

function hasNewCommitteeShape(data) {
  if (!data || typeof data !== "object") return false;
  return (
    COMMITTEE_GROUP_IDS.some((id) => Array.isArray(data[id])) ||
    Boolean(data.groupSettings)
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

  const lists = normalizeAllMemberLists({}, fb);
  lists.organizingSenior = organizingSenior.length
    ? organizingSenior
    : normalizeMemberList(fb.organizingSenior, "org-sr");
  lists.organizingJuniors = normalizeMemberList(
    data.organizingJuniors?.length ? data.organizingJuniors : fb.organizingJuniors,
    "org-jr"
  );
  lists.scientific = scientificSource.length
    ? normalizeMemberList(scientificSource, "sci")
    : normalizeMemberList(fb.scientific, "sci");

  return {
    ...lists,
    groupSettings: defaultGroupSettings(),
  };
}

export function normalizeCommittees(data, fallback) {
  const fb = fallback ?? defaultCommittees;

  if (!data || typeof data !== "object") {
    return {
      ...normalizeAllMemberLists({}, fb),
      groupSettings: defaultGroupSettings(),
    };
  }

  if (!hasNewCommitteeShape(data)) {
    return migrateLegacyCommittees(data, fb);
  }

  return {
    ...normalizeAllMemberLists(data, fb),
    groupSettings: normalizeGroupSettings(data.groupSettings, fb),
  };
}

export function isCommitteeGroupEnabled(committees, groupId) {
  return committees?.groupSettings?.[groupId]?.enabled !== false;
}

export function getVisibleMembers(members) {
  return (members ?? []).filter((m) => m && m.enabled !== false && m.name?.trim());
}

export function getVisibleGroupMembers(committees, groupId) {
  if (!isCommitteeGroupEnabled(committees, groupId)) return [];
  return getVisibleMembers(committees?.[groupId]);
}

export function countCommitteeMembers(members) {
  const named = (members ?? []).filter((m) => m?.name?.trim());
  const visible = named.filter((m) => m.enabled !== false);
  return {
    total: named.length,
    visible: visible.length,
    hidden: named.length - visible.length,
  };
}

export function countAllVisibleCommitteeMembers(committees) {
  return COMMITTEE_GROUPS.reduce((sum, group) => {
    if (!isCommitteeGroupEnabled(committees, group.id)) return sum;
    return sum + getVisibleMembers(committees[group.id]).length;
  }, 0);
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
  const stripMember = (members, prefix) =>
    normalizeMemberList(Array.isArray(members) ? members : [], prefix).map(
      ({ id, name, affiliation, email, enabled }) => ({
        id,
        name,
        affiliation,
        ...(email ? { email } : {}),
        enabled,
      })
    );

  const payload = {
    groupSettings: normalizeGroupSettings(form?.groupSettings, { groupSettings: defaultGroupSettings() }),
  };

  for (const group of COMMITTEE_GROUPS) {
    payload[group.id] = stripMember(form?.[group.id], group.prefix);
  }

  return payload;
}

export function hydrateCommitteesForEdit(raw) {
  const data = normalizeCommittees(raw);
  const form = {
    groupSettings: { ...data.groupSettings },
  };

  for (const group of COMMITTEE_GROUPS) {
    form[group.id] = data[group.id] ?? [];
  }

  return form;
}

export function memberInitial(name) {
  const cleaned = String(name ?? "")
    .replace(/^(Prof\.|Dr\.|Pr\.)\s*/i, "")
    .trim();
  return cleaned.charAt(0) || "?";
}

export function getCommitteeGroupMeta(groupId) {
  return groupMeta(groupId);
}
