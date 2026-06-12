import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import * as defaults from "../data/defaults";
import { fetchAllContent } from "../lib/contentApi";
import { normalizeHeroImage, resolveHeroBackgroundPath } from "../lib/heroImages";
import { normalizeHeroHighlights } from "../lib/heroHighlights";
import { normalizeHeroContent } from "../lib/heroContent";
import { normalizeDates } from "../lib/dates";
import { normalizeSpeakers } from "../lib/speakers";
import { normalizeTopics } from "../lib/topics";
import { normalizePartners } from "../lib/partners";
import { normalizeSectionSettings } from "../lib/sectionSettings";
import { normalizeCallForPapers } from "../lib/callForPapers";
import { normalizeCommittees } from "../lib/committees";
import { normalizeFooter } from "../lib/footer";
import { normalizeRegistrationPricing } from "../lib/registrationPricing";
import { normalizeWorkshops } from "../lib/workshops";
import { getPublicEditionsDropdown, normalizeEditionsDropdown } from "../lib/previousEditions";
import { isSupabaseConfigured } from "../lib/supabase";

const ConferenceContext = createContext(null);

/** List fields come from Supabase only when connected; static files are dev fallback. */
function dbList(remoteValue, fallbackValue, fromDb) {
  return fromDb ? (remoteValue ?? []) : (fallbackValue ?? []);
}

function buildState(remote, fallback) {
  const fb = fallback;
  const r = remote ?? {};
  const fromDb = Boolean(remote);

  const conference = r.conference ?? fb.conference;
  const editionsDropdownRaw = normalizeEditionsDropdown(
    r.previousEditions ?? null,
    fb.editionsDropdown
  );
  return {
    conference,
    navLinks: r.navLinks ?? fb.navLinks,
    heroImages: (() => {
      const heroImage = normalizeHeroImage(r.heroImages ?? fb.heroImages);
      return {
        ...heroImage,
        src: resolveHeroBackgroundPath(heroImage.src),
      };
    })(),
    heroHighlights: normalizeHeroHighlights(r.heroHighlights ?? fb.heroHighlights),
    heroContent: normalizeHeroContent(
      r.heroContent ?? fb.heroContent,
      conference,
      fb.heroContent
    ),
    submissionGuidelines: r.submissionGuidelines ?? fb.submissionGuidelines,
    registrationPricing: normalizeRegistrationPricing(
      r.registrationPricing ?? fb.registrationPricing,
      fb.registrationPricing
    ),
    committees: normalizeCommittees(r.committees ?? fb.committees, fb.committees),
    sectionSettings: normalizeSectionSettings(r.sectionSettings ?? fb.sectionSettings),
    workshops: normalizeWorkshops(dbList(r.workshops, fb.workshops, fromDb)),
    callForPapers: normalizeCallForPapers(
      r.callForPapers ?? fb.callForPapers,
      conference
    ),
    quickLinks: dbList(r.quickLinks, fb.quickLinks, fromDb),
    participationSteps: normalizeDates(dbList(r.participationSteps, fb.participationSteps, fromDb)),
    editionsDropdown: getPublicEditionsDropdown(editionsDropdownRaw),
    editionsDropdownAdmin: editionsDropdownRaw,
    partners: normalizePartners(dbList(r.partners, fb.partners, fromDb)),
    footer: normalizeFooter(
      r.footer ?? (r.footerLinks ? { legacy: r.footerLinks } : null),
      fb.footer,
      conference
    ),
    speakers: normalizeSpeakers(dbList(r.speakers, fb.speakers, fromDb)),
    topics: normalizeTopics(dbList(r.topics, fb.topics, fromDb)),
    source: fromDb ? "supabase" : "local",
  };
}

export function ConferenceProvider({ children }) {
  const [data, setData] = useState(() => buildState(null, defaults));
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setData(buildState(null, defaults));
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const remote = await fetchAllContent();
      setData(buildState(remote, defaults));
    } catch (err) {
      setError(err.message);
      setData(buildState(null, defaults));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({ ...data, loading, error, refresh, isLive: data.source === "supabase" }),
    [data, loading, error, refresh]
  );

  return (
    <ConferenceContext.Provider value={value}>{children}</ConferenceContext.Provider>
  );
}

export function useConference() {
  const ctx = useContext(ConferenceContext);
  if (!ctx) throw new Error("useConference must be used within ConferenceProvider");
  return ctx;
}
