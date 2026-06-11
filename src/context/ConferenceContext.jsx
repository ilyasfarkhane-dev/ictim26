import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import * as defaults from "../data/defaults";
import { fetchAllContent } from "../lib/contentApi";
import { normalizeHeroImage, resolveHeroBackgroundPath } from "../lib/heroImages";
import { normalizeHeroHighlights } from "../lib/heroHighlights";
import { normalizeSpeakers } from "../lib/speakers";
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

  const previousEditions = r.previousEditions ?? fb.previousEditions;
  return {
    conference: r.conference ?? fb.conference,
    navLinks: r.navLinks ?? fb.navLinks,
    heroImages: (() => {
      const heroImage = normalizeHeroImage(r.heroImages ?? fb.heroImages);
      return {
        ...heroImage,
        src: resolveHeroBackgroundPath(heroImage.src),
      };
    })(),
    heroHighlights: normalizeHeroHighlights(r.heroHighlights ?? fb.heroHighlights),
    submissionGuidelines: r.submissionGuidelines ?? fb.submissionGuidelines,
    registrationPricing: r.registrationPricing ?? fb.registrationPricing,
    workshops: dbList(r.workshops, fb.workshops, fromDb),
    callForPapers: r.callForPapers ?? fb.callForPapers,
    quickLinks: dbList(r.quickLinks, fb.quickLinks, fromDb),
    participationSteps: dbList(r.participationSteps, fb.participationSteps, fromDb),
    previousEditions,
    editionsDropdown: {
      label: "Previous Editions",
      items: previousEditions.map((e) => ({
        label: e.name,
        subtitle: e.category,
        href: e.href,
      })),
    },
    partners: dbList(r.partners, fb.partners, fromDb),
    footerLinks: r.footerLinks ?? fb.footerLinks,
    speakers: normalizeSpeakers(dbList(r.speakers, fb.speakers, fromDb)),
    topics: dbList(r.topics, fb.topics, fromDb),
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
