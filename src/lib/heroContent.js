import { withBase } from "../config/paths";

const DEFAULT_BOOK_COVER = "/assets/book.jpeg";

export function buildDefaultProceedingsPanel(conference) {
  const conferenceName = conference?.name?.trim() || "ICTIM'26";
  return {
    enabled: true,
    cardTitle: "ICTIM 2024 Proceedings",
    cardSubtitle: "Published in Springer CCIS Series",
    bookTitle: "Technologies of Information and Modeling",
    bookHref: "https://link.springer.com/book/10.1007/978-3-032-15147-6",
    bookCoverSrc: DEFAULT_BOOK_COVER,
    features: [
      "Proceedings of the 7th International Conference on Information Technology and Modeling (ICTIM 2024)",
      "Published in Springer CCIS Series",
      "Indexed in Scopus",
    ],
    viewButtonLabel: "View Proceedings",
    submitEnabled: true,
    submitTitle: "Submit your paper now!",
    submitSubtitle: `Be part of ${conferenceName} Proceedings`,
    submitHref: "#call-for-papers",
  };
}

export function buildDefaultHeroContent(conference) {
  return {
    badge: "International Conference · TIM Laboratory",
    fullName: conference?.fullName ?? "",
    title: conference?.name ?? "",
    subtitle: "Information Technology & Modeling",
    tagline: conference?.tagline ?? "",
    publication: conference?.publication ?? "",
    dates: conference?.dates ?? "",
    venue: conference?.venue ?? "",
    ctas: [
      {
        id: "cta-primary",
        label: "Call for Papers",
        href: "#call-for-papers",
        variant: "primary",
        enabled: true,
      },
      {
        id: "cta-secondary",
        label: "Important Dates",
        href: "#important-dates",
        variant: "secondary",
        enabled: true,
      },
    ],
    proceedingsPanel: buildDefaultProceedingsPanel(conference),
  };
}

function resolveText(value, fallback) {
  const trimmed = String(value ?? "").trim();
  return trimmed || String(fallback ?? "").trim();
}

function normalizeCta(raw, index, fallback) {
  const fb = fallback ?? {};
  return {
    id: raw?.id ?? fb.id ?? `cta-${index + 1}`,
    label: resolveText(raw?.label, fb.label) || `Button ${index + 1}`,
    href: resolveText(raw?.href, fb.href) || "#",
    variant: raw?.variant === "secondary" ? "secondary" : "primary",
    enabled: raw?.enabled !== false,
  };
}

function normalizeFeatures(raw, fallback) {
  const fb = Array.isArray(fallback) ? fallback : [];
  const source = Array.isArray(raw) ? raw : fb;
  const features = source
    .map((item) => String(item ?? "").trim())
    .filter(Boolean)
    .slice(0, 3);

  while (features.length < 3) {
    features.push(fb[features.length] ?? "");
  }

  return features;
}

export function resolveProceedingsCoverSrc(src) {
  const path = String(src ?? "").trim();
  if (!path) return withBase(DEFAULT_BOOK_COVER);
  if (path.startsWith("/")) return withBase(path);
  return path;
}

function normalizeProceedingsPanel(raw, conference, fallback) {
  const defaults = buildDefaultProceedingsPanel(conference);
  const fb = fallback?.proceedingsPanel
    ? { ...defaults, ...fallback.proceedingsPanel }
    : defaults;
  const src = raw && typeof raw === "object" ? raw : {};

  return {
    enabled: src.enabled !== false,
    cardTitle: resolveText(src.cardTitle, fb.cardTitle),
    cardSubtitle: resolveText(src.cardSubtitle, fb.cardSubtitle),
    bookTitle: resolveText(src.bookTitle, fb.bookTitle),
    bookHref: resolveText(src.bookHref, fb.bookHref) || defaults.bookHref,
    bookCoverSrc: resolveText(src.bookCoverSrc, fb.bookCoverSrc) || DEFAULT_BOOK_COVER,
    features: normalizeFeatures(src.features, fb.features),
    viewButtonLabel: resolveText(src.viewButtonLabel, fb.viewButtonLabel) || "View Proceedings",
    submitEnabled: src.submitEnabled !== false,
    submitTitle: resolveText(src.submitTitle, fb.submitTitle) || defaults.submitTitle,
    submitSubtitle: resolveText(src.submitSubtitle, fb.submitSubtitle) || defaults.submitSubtitle,
    submitHref: resolveText(src.submitHref, fb.submitHref) || defaults.submitHref,
  };
}

export function normalizeHeroContent(data, conference, fallback) {
  const defaults = buildDefaultHeroContent(conference);
  const fb = fallback ? { ...defaults, ...fallback } : defaults;
  const src = data && typeof data === "object" ? data : {};

  const defaultCtas = fb.ctas ?? defaults.ctas;
  const rawCtas = Array.isArray(src.ctas) ? src.ctas : defaultCtas;

  return {
    badge: resolveText(src.badge, fb.badge),
    fullName: resolveText(src.fullName, fb.fullName),
    title: resolveText(src.title, fb.title),
    subtitle: resolveText(src.subtitle, fb.subtitle),
    tagline: resolveText(src.tagline, fb.tagline),
    publication: resolveText(src.publication, fb.publication),
    dates: resolveText(src.dates, fb.dates),
    venue: resolveText(src.venue, fb.venue),
    ctas: rawCtas.map((cta, i) => normalizeCta(cta, i, defaultCtas[i])),
    proceedingsPanel: normalizeProceedingsPanel(
      src.proceedingsPanel,
      conference,
      fb
    ),
  };
}

export function getVisibleHeroCtas(content) {
  return (content?.ctas ?? []).filter((cta) => cta && cta.enabled !== false && cta.label?.trim());
}

export function getHeroProceedingsPanel(content) {
  const panel = content?.proceedingsPanel;
  if (!panel || panel.enabled === false) return null;
  return panel;
}

function trimText(value) {
  return String(value ?? "").trim();
}

export function prepareHeroContentForSave(content) {
  const panel = content?.proceedingsPanel ?? {};

  return {
    badge: trimText(content?.badge),
    fullName: trimText(content?.fullName),
    title: trimText(content?.title),
    subtitle: trimText(content?.subtitle),
    tagline: trimText(content?.tagline),
    publication: trimText(content?.publication),
    dates: trimText(content?.dates),
    venue: trimText(content?.venue),
    ctas: (content?.ctas ?? []).map((cta, index) => ({
      id: cta?.id ?? `cta-${index + 1}`,
      label: trimText(cta?.label),
      href: trimText(cta?.href),
      variant: cta?.variant === "secondary" ? "secondary" : "primary",
      enabled: cta?.enabled !== false,
    })),
    proceedingsPanel: {
      enabled: panel.enabled !== false,
      cardTitle: trimText(panel.cardTitle),
      cardSubtitle: trimText(panel.cardSubtitle),
      bookTitle: trimText(panel.bookTitle),
      bookHref: trimText(panel.bookHref),
      bookCoverSrc: trimText(panel.bookCoverSrc),
      features: normalizeFeatures(panel.features, []),
      viewButtonLabel: trimText(panel.viewButtonLabel) || "View Proceedings",
      submitEnabled: panel.submitEnabled !== false,
      submitTitle: trimText(panel.submitTitle),
      submitSubtitle: trimText(panel.submitSubtitle),
      submitHref: trimText(panel.submitHref),
    },
  };
}

export function hydrateHeroContentForEdit(raw, conference) {
  const defaults = buildDefaultHeroContent(conference);
  const src = raw && typeof raw === "object" ? raw : {};
  const field = (key) => (src[key] !== undefined ? src[key] : defaults[key]);

  const defaultCtas = defaults.ctas;
  const rawCtas = Array.isArray(src.ctas) ? src.ctas : defaultCtas;

  return {
    badge: field("badge"),
    fullName: field("fullName"),
    title: field("title"),
    subtitle: field("subtitle"),
    tagline: field("tagline"),
    publication: field("publication"),
    dates: field("dates"),
    venue: field("venue"),
    ctas: rawCtas.map((cta, i) => normalizeCta(cta, i, defaultCtas[i])),
    proceedingsPanel: normalizeProceedingsPanel(
      src.proceedingsPanel ?? defaults.proceedingsPanel,
      conference,
      defaults
    ),
  };
}
