export const DEFAULT_CTA_LABEL = "Submit Your Research";

/** Normalize call-for-papers content (legacy rows get default CTA). */
export function normalizeCallForPapers(data, conference) {
  const fallbackHref = conference?.registrationUrl ?? "";
  return {
    intro: data?.intro ?? "",
    publication: Array.isArray(data?.publication) ? data.publication : [],
    requirements: Array.isArray(data?.requirements) ? data.requirements : [],
    cta: {
      label: data?.cta?.label?.trim() || DEFAULT_CTA_LABEL,
      href: data?.cta?.href?.trim() || fallbackHref,
    },
  };
}
