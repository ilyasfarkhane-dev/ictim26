import { footerLinks as defaultFooterLinks } from "../data/conference";

function defaultContact(conference) {
  return {
    address: conference?.contact?.address ?? "",
    phone: conference?.contact?.phone ?? "",
    emails: Array.isArray(conference?.contact?.emails)
      ? conference.contact.emails.filter(Boolean)
      : [],
  };
}

function normalizeLink(raw, index, prefix = "link") {
  if (!raw || typeof raw !== "object") return null;
  const label = String(raw.label ?? "").trim();
  if (!label) return null;
  return {
    id: raw.id ?? `${prefix}-${index + 1}`,
    label,
    href: String(raw.href ?? "#").trim() || "#",
    enabled: raw.enabled !== false,
  };
}

function normalizeColumn(raw, index) {
  if (!raw || typeof raw !== "object") return null;
  const title = String(raw.title ?? "").trim() || `Column ${index + 1}`;
  const links = (raw.links ?? [])
    .map((link, i) => normalizeLink(link, i, `link-${index}`))
    .filter(Boolean);
  return {
    id: raw.id ?? `col-${index + 1}`,
    title,
    enabled: raw.enabled !== false,
    links,
  };
}

function columnsFromLegacyLinks(legacy) {
  if (!legacy || typeof legacy !== "object") return [];
  return Object.entries(legacy).map(([title, links], index) =>
    normalizeColumn(
      {
        id: `col-${index + 1}`,
        title,
        enabled: true,
        links: Array.isArray(links) ? links : [],
      },
      index
    )
  ).filter(Boolean);
}

function defaultColumns() {
  return columnsFromLegacyLinks(defaultFooterLinks);
}

export function normalizeFooter(data, fallback, conference) {
  const fb = fallback ?? { columns: defaultColumns() };
  let columns = [];

  if (data?.columns?.length) {
    columns = data.columns.map(normalizeColumn).filter(Boolean);
  } else if (data?.legacy && typeof data.legacy === "object") {
    columns = columnsFromLegacyLinks(data.legacy);
  } else if (fb.columns?.length) {
    columns = fb.columns.map(normalizeColumn).filter(Boolean);
  } else {
    columns = defaultColumns();
  }

  const contactSource = data?.contact ?? fb.contact ?? defaultContact(conference);

  return {
    about: String(data?.about ?? fb.about ?? "").trim(),
    copyright: String(data?.copyright ?? fb.copyright ?? "").trim(),
    contactTitle: String(data?.contactTitle ?? fb.contactTitle ?? "Contact").trim() || "Contact",
    contact: {
      address: String(contactSource.address ?? defaultContact(conference).address).trim(),
      phone: String(contactSource.phone ?? defaultContact(conference).phone).trim(),
      emails: (Array.isArray(contactSource.emails) ? contactSource.emails : [])
        .map((e) => String(e).trim())
        .filter(Boolean),
    },
    columns,
  };
}

export function getVisibleFooterColumns(footer) {
  return (footer?.columns ?? [])
    .filter((col) => col && col.enabled !== false)
    .map((col) => ({
      ...col,
      links: (col.links ?? []).filter((link) => link && link.enabled !== false),
    }))
    .filter((col) => col.links.length > 0);
}

export function footerAboutText(footer, conference) {
  if (footer?.about?.trim()) return footer.about.trim();
  return `${conference.fullName}. Organized by ${conference.organizer} at ${conference.location}.`;
}

export function footerCopyrightText(footer, conference) {
  if (footer?.copyright?.trim()) return footer.copyright.trim();
  return `© ${new Date().getFullYear()} ${conference.name}. All Rights Reserved.`;
}

export function emptyLink(columnIndex = 0) {
  return {
    id: `link-${columnIndex}-${Date.now()}`,
    label: "",
    href: "",
    enabled: true,
  };
}

export function emptyColumn() {
  return {
    id: `col-${Date.now()}`,
    title: "",
    enabled: true,
    links: [emptyLink()],
  };
}

export function prepareFooterForSave(form) {
  const normalized = normalizeFooter(form);
  return {
    about: normalized.about,
    copyright: normalized.copyright,
    contactTitle: normalized.contactTitle,
    contact: normalized.contact,
    columns: normalized.columns.map((col) => ({
      id: col.id,
      title: col.title,
      enabled: col.enabled,
      links: col.links.map(({ id, label, href, enabled }) => ({
        id,
        label,
        href,
        enabled,
      })),
    })),
  };
}

export function hydrateFooterForEdit(raw, conference) {
  const data = normalizeFooter(raw, null, conference);
  return {
    about: data.about,
    copyright: data.copyright,
    contactTitle: data.contactTitle,
    contact: {
      ...data.contact,
      emails: data.contact.emails.length ? data.contact.emails : [""],
    },
    columns: data.columns.length
      ? data.columns.map((col) => ({
          ...col,
          links: col.links.length ? col.links : [emptyLink()],
        }))
      : [emptyColumn()],
  };
}
