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

function normalizeInstitution(raw, fallback) {
  const fb = fallback ?? defaultCommittees.organizing?.institution ?? {};
  const src = raw && typeof raw === "object" ? raw : {};
  return {
    name: String(src.name ?? fb.name ?? "").trim(),
    address: String(src.address ?? fb.address ?? "").trim(),
  };
}

export function normalizeCommittees(data, fallback) {
  const fb = fallback ?? defaultCommittees;

  if (!data || typeof data !== "object") {
    return {
      programChairs: normalizeMemberList(fb.programChairs, "pch"),
      externalReviewers: normalizeMemberList(fb.externalReviewers, "er"),
      organizing: {
        programChairs: normalizeMemberList(fb.organizing?.programChairs, "org-pc"),
        institution: normalizeInstitution(fb.organizing?.institution, fb.organizing?.institution),
      },
    };
  }

  return {
    programChairs: normalizeMemberList(
      data.programChairs?.length ? data.programChairs : fb.programChairs,
      "pch"
    ),
    externalReviewers: normalizeMemberList(
      data.externalReviewers?.length ? data.externalReviewers : fb.externalReviewers,
      "er"
    ),
    organizing: {
      programChairs: normalizeMemberList(
        data.organizing?.programChairs?.length
          ? data.organizing.programChairs
          : fb.organizing?.programChairs,
        "org-pc"
      ),
      institution: normalizeInstitution(data.organizing?.institution, fb.organizing?.institution),
    },
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
  const stripEmail = (members) =>
    members.map(({ id, name, affiliation, email, enabled }) => ({
      id,
      name,
      affiliation,
      ...(email ? { email } : {}),
      enabled,
    }));

  return {
    programChairs: stripEmail(normalized.programChairs),
    externalReviewers: stripEmail(normalized.externalReviewers),
    organizing: {
      programChairs: stripEmail(normalized.organizing.programChairs),
      institution: normalized.organizing.institution,
    },
  };
}

export function hydrateCommitteesForEdit(raw) {
  const data = normalizeCommittees(raw);
  return {
    programChairs: data.programChairs.length
      ? data.programChairs
      : [emptyMember("pch")],
    externalReviewers: data.externalReviewers.length
      ? data.externalReviewers
      : [emptyMember("er")],
    organizing: {
      programChairs: data.organizing.programChairs.length
        ? data.organizing.programChairs
        : [emptyMember("org-pc")],
      institution: { ...data.organizing.institution },
    },
  };
}

export function memberInitial(name) {
  const cleaned = String(name ?? "")
    .replace(/^(Prof\.|Dr\.|Pr\.)\s*/i, "")
    .trim();
  return cleaned.charAt(0) || "?";
}
