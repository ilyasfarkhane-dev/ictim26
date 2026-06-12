import { useCallback, useEffect, useRef, useState } from "react";
import {
  HiOutlineArrowRight,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
} from "react-icons/hi2";
import Container from "../components/Container";
import SectionHeader from "../components/SectionHeader";
import CloudinaryImage from "../components/CloudinaryImage";
import SpeakerBioModal from "../components/SpeakerBioModal";
import { useConference } from "../hooks/useConference";
import { getVisibleSpeakers } from "../lib/speakers";

function speakerInitial(name) {
  return (name?.trim()?.[0] ?? "?").toUpperCase();
}

function SpeakerCard({ speaker, onSelect }) {
  const affiliation = speaker.company?.trim() || speaker.position?.trim();
  const hasImage = Boolean(speaker.image?.trim());

  return (
    <button
      type="button"
      data-speaker-slide
      onClick={() => onSelect(speaker)}
      aria-label={`View biography for ${speaker.name}`}
      className="group relative aspect-[4/5] min-h-[420px] w-full shrink-0 snap-start cursor-pointer overflow-hidden border border-border bg-white text-left shadow-sm transition-shadow duration-200 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 sm:min-h-[460px] lg:min-h-[480px]"
    >
      {hasImage ? (
        <CloudinaryImage
          src={speaker.image}
          alt=""
          width={400}
          height={500}
          className="absolute inset-0 h-full w-full object-cover object-top transition-opacity duration-200 group-hover:opacity-95"
        />
      ) : (
        <div
          className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-light-blue to-primary/10"
          aria-hidden="true"
        >
          <span className="text-5xl font-bold text-primary/40">
            {speakerInitial(speaker.name)}
          </span>
        </div>
      )}

      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-navy/95 via-navy/45 to-transparent"
        aria-hidden="true"
      />

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 px-3 pb-4 pt-16 text-center sm:px-4 sm:pb-5">
        <span className="text-sm font-bold leading-snug text-white sm:text-base">
          {speaker.name}
        </span>
        {affiliation && (
          <p className="mt-1.5 text-[11px] leading-snug text-white/85 sm:text-xs">
            {affiliation}
          </p>
        )}
        <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-navy shadow-sm sm:gap-2 sm:px-3.5 sm:py-2 sm:text-xs">
          View biography
          <HiOutlineArrowRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        </span>
      </div>
    </button>
  );
}

function SpeakersCarousel({ speakers, onSelect }) {
  const trackRef = useRef(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const updateScrollState = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;

    const maxScroll = track.scrollWidth - track.clientWidth;
    setCanScrollPrev(track.scrollLeft > 4);
    setCanScrollNext(track.scrollLeft < maxScroll - 4);
  }, []);

  useEffect(() => {
    updateScrollState();
    const track = trackRef.current;
    if (!track) return;

    track.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);

    return () => {
      track.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [speakers.length, updateScrollState]);

  const scroll = (direction) => {
    const track = trackRef.current;
    if (!track) return;

    const slide = track.querySelector("[data-speaker-slide]");
    if (!slide) return;

    const styles = getComputedStyle(track);
    const gap = parseFloat(styles.columnGap || styles.gap || "0") || 0;
    const distance = slide.getBoundingClientRect().width + gap;

    track.scrollBy({
      left: direction === "next" ? distance : -distance,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
  };

  const showControls = speakers.length > 3;

  const navButtonClass =
    "flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full border border-primary bg-primary text-white shadow-sm transition-colors duration-200 hover:border-secondary hover:bg-secondary disabled:cursor-not-allowed disabled:border-primary/40 disabled:bg-primary/40 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 lg:h-12 lg:w-12";

  return (
    <div className="relative">
      <div className="flex items-center gap-3 sm:gap-4 lg:gap-5">
        {showControls && (
          <button
            type="button"
            onClick={() => scroll("prev")}
            disabled={!canScrollPrev}
            aria-label="Previous speakers"
            className={`${navButtonClass} hidden sm:flex`}
          >
            <HiOutlineChevronLeft className="h-5 w-5" aria-hidden="true" />
          </button>
        )}

        <div
          ref={trackRef}
          className="flex min-w-0 flex-1 snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:gap-10"
        >
          {speakers.map((speaker) => (
            <div
              key={speaker.id}
              className="w-[calc(100%-2rem)] shrink-0 snap-start sm:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-5rem)/3)]"
            >
              <SpeakerCard speaker={speaker} onSelect={onSelect} />
            </div>
          ))}
        </div>

        {showControls && (
          <button
            type="button"
            onClick={() => scroll("next")}
            disabled={!canScrollNext}
            aria-label="Next speakers"
            className={`${navButtonClass} hidden sm:flex`}
          >
            <HiOutlineChevronRight className="h-5 w-5" aria-hidden="true" />
          </button>
        )}
      </div>

      {showControls && (
        <div className="mt-4 flex justify-center gap-3 sm:hidden">
          <button
            type="button"
            onClick={() => scroll("prev")}
            disabled={!canScrollPrev}
            aria-label="Previous speakers"
            className={navButtonClass}
          >
            <HiOutlineChevronLeft className="h-5 w-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => scroll("next")}
            disabled={!canScrollNext}
            aria-label="Next speakers"
            className={navButtonClass}
          >
            <HiOutlineChevronRight className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}

export default function Speakers() {
  const { speakers } = useConference();
  const visibleSpeakers = getVisibleSpeakers(speakers);
  const [selectedSpeaker, setSelectedSpeaker] = useState(null);

  if (visibleSpeakers.length === 0) return null;

  return (
    <>
      <section id="speakers" className="overflow-hidden bg-section py-20 lg:py-28">
        <Container>
          <SectionHeader
            title="Speakers"
            subtitle="Renowned professors and researchers from leading universities worldwide."
          />

          <SpeakersCarousel speakers={visibleSpeakers} onSelect={setSelectedSpeaker} />
        </Container>
      </section>

      <SpeakerBioModal
        speaker={selectedSpeaker}
        open={Boolean(selectedSpeaker)}
        onClose={() => setSelectedSpeaker(null)}
      />
    </>
  );
}
