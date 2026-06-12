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
  };
}

export function getVisibleHeroCtas(content) {
  return (content?.ctas ?? []).filter((cta) => cta && cta.enabled !== false && cta.label?.trim());
}

function trimText(value) {
  return String(value ?? "").trim();
}

export function prepareHeroContentForSave(content) {
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
  };
}
