import { useEffect, useMemo, useState } from "react";
import {
  HiOutlinePhoto,
  HiOutlineChartBar,
  HiOutlineDocumentText,
  HiOutlineCursorArrowRays,
  HiOutlineArrowTopRightOnSquare,
} from "react-icons/hi2";
import DashToggle from "../../components/dashboard/DashToggle";
import StatusBanner from "../../components/dashboard/StatusBanner";
import DashButton from "../../components/dashboard/DashButton";
import { DashInput, DashTextarea } from "../../components/dashboard/DashInput";
import ImageUpload from "../../components/dashboard/ImageUpload";
import { useConference } from "../../hooks/useConference";
import { upsertSetting } from "../../lib/contentApi";
import { CLOUDINARY_FOLDERS } from "../../lib/cloudinary";
import { withBase } from "../../config/paths";
import { DEFAULT_HERO_ALT, normalizeHeroImage } from "../../lib/heroImages";
import {
  isHighlightEnabled,
  normalizeHeroHighlights,
} from "../../lib/heroHighlights";
import {
  hydrateHeroContentForEdit,
  prepareHeroContentForSave,
} from "../../lib/heroContent";

function buildFormState(heroImages, heroHighlights, heroContent, conference) {
  return {
    image: normalizeHeroImage(heroImages),
    highlights: normalizeHeroHighlights(heroHighlights),
    content: hydrateHeroContentForEdit(heroContent, conference),
  };
}

function SectionHeader({ icon: Icon, title, description }) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-dash-primary">
        <Icon className="w-5 h-5" aria-hidden="true" />
      </span>
      <div>
        <h2 className="text-lg font-bold text-dash-text">{title}</h2>
        {description && (
          <p className="mt-1 text-sm text-dash-muted leading-relaxed">{description}</p>
        )}
      </div>
    </div>
  );
}

function CtaEditor({ cta, index, onUpdate }) {
  const enabled = cta.enabled !== false;
  const toggleId = `hero-cta-toggle-${cta.id ?? index}`;
  const isPrimary = cta.variant !== "secondary";

  return (
    <div
      className={`rounded-xl border p-4 space-y-4 transition-colors duration-200 ${
        enabled
          ? "border-dash-border bg-white hover:border-dash-primary/20"
          : "border-dash-border/80 bg-dash-bg/40 opacity-75"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <DashToggle
            id={toggleId}
            enabled={enabled}
            onChange={(next) => onUpdate({ enabled: next })}
            ariaLabel={enabled ? "Button visible on homepage" : "Button hidden on homepage"}
          />
          <div>
            <label
              htmlFor={toggleId}
              className="text-xs font-semibold uppercase tracking-wider text-dash-text cursor-pointer"
            >
              {isPrimary ? "Primary button" : "Secondary button"}
            </label>
            <p className="text-[11px] text-dash-muted mt-0.5">
              {enabled ? "Visible on homepage" : "Hidden on homepage"}
            </p>
          </div>
        </div>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
            enabled ? "bg-blue-50 text-dash-primary" : "bg-slate-100 text-dash-muted"
          }`}
        >
          {enabled ? "On" : "Off"}
        </span>
      </div>

      <DashInput
        label="Label"
        value={cta.label ?? ""}
        onChange={(e) => onUpdate({ label: e.target.value })}
        placeholder={isPrimary ? "Call for Papers" : "Important Dates"}
        disabled={!enabled}
      />
    </div>
  );
}

export default function HeroPage() {
  const { conference, heroImages, heroHighlights, heroContent, refresh } = useConference();
  const [savedSnapshot, setSavedSnapshot] = useState(() =>
    buildFormState(heroImages, heroHighlights, heroContent, conference)
  );
  const [form, setForm] = useState(() =>
    buildFormState(heroImages, heroHighlights, heroContent, conference)
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const next = buildFormState(heroImages, heroHighlights, heroContent, conference);
    setForm(next);
    setSavedSnapshot(next);
  }, [heroImages, heroHighlights, heroContent, conference]);

  const isDirty = useMemo(
    () => JSON.stringify(form) !== JSON.stringify(savedSnapshot),
    [form, savedSnapshot]
  );

  const updateHighlight = (index, field, value) => {
    setForm((f) => ({
      ...f,
      highlights: f.highlights.map((h, i) =>
        i === index ? { ...h, [field]: value } : h
      ),
    }));
    setMessage("");
  };

  const updateContent = (field, value) => {
    setForm((f) => ({
      ...f,
      content: { ...f.content, [field]: value },
    }));
    setMessage("");
  };

  const updateCta = (index, patch) => {
    setForm((f) => ({
      ...f,
      content: {
        ...f.content,
        ctas: f.content.ctas.map((cta, i) => (i === index ? { ...cta, ...patch } : cta)),
      },
    }));
    setMessage("");
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      await Promise.all([
        upsertSetting("hero_images", form.image),
        upsertSetting("hero_highlights", form.highlights),
        upsertSetting("hero_content", prepareHeroContentForSave(form.content)),
      ]);
      await refresh();
      setSavedSnapshot(form);
      setMessage("Hero section saved successfully.");
    } catch (err) {
      setMessage(err.message);
    } finally {
      setSaving(false);
    }
  };

  const { content } = form;

  return (
    <div className={isDirty ? "pb-24" : ""}>
      <div className="mb-8 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-dash-muted mb-1">
            Homepage
          </p>
          <h1 className="text-2xl font-bold text-dash-text">Hero Management</h1>
          <p className="mt-1 text-sm text-dash-muted max-w-xl">
            Manage all homepage hero content — copy, meta pills, call-to-action buttons, background
            image, and highlight stats.
          </p>
        </div>
        <a
          href={`${withBase("/")}#home`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-xl border border-dash-border bg-white px-4 py-2.5 text-sm font-medium text-dash-text hover:bg-blue-50/80 hover:border-dash-primary/30 transition-colors duration-200 cursor-pointer dash-focus-ring shrink-0"
        >
          View homepage
          <HiOutlineArrowTopRightOnSquare className="w-4 h-4 text-dash-primary" aria-hidden="true" />
        </a>
      </div>

      {message && (
        <div className="mb-6 max-w-4xl">
          <StatusBanner message={message} />
        </div>
      )}

      <form id="hero-form" onSubmit={handleSave} className="space-y-6 max-w-4xl">
        <section className="dash-card p-6 space-y-6">
          <SectionHeader
            icon={HiOutlineDocumentText}
            title="Hero copy"
            description="Headline text, tagline, and publication note shown over the hero background."
          />

          <div className="space-y-4">
            <DashInput
              label="Badge"
              value={content.badge ?? ""}
              onChange={(e) => updateContent("badge", e.target.value)}
              placeholder="International Conference · TIM Laboratory"
            />
            <DashInput
              label="Full conference name"
              value={content.fullName ?? ""}
              onChange={(e) => updateContent("fullName", e.target.value)}
              placeholder={conference.fullName}
            />
            <DashInput
              label="Title (main heading)"
              value={content.title ?? ""}
              onChange={(e) => updateContent("title", e.target.value)}
              placeholder={conference.name}
            />
            <DashInput
              label="Subtitle"
              value={content.subtitle ?? ""}
              onChange={(e) => updateContent("subtitle", e.target.value)}
              placeholder="Information Technology & Modeling"
            />
            <DashTextarea
              label="Tagline"
              value={content.tagline ?? ""}
              onChange={(e) => updateContent("tagline", e.target.value)}
              placeholder={conference.tagline}
              rows={3}
            />
            <DashTextarea
              label="Publication note"
              value={content.publication ?? ""}
              onChange={(e) => updateContent("publication", e.target.value)}
              placeholder={conference.publication}
              rows={3}
            />
          </div>
        </section>

        <section className="dash-card p-6 space-y-6">
          <SectionHeader
            icon={HiOutlineDocumentText}
            title="Date & venue pills"
            description="Short meta labels displayed below the hero copy."
          />

          <div className="grid sm:grid-cols-2 gap-4">
            <DashInput
              label="Dates"
              value={content.dates ?? ""}
              onChange={(e) => updateContent("dates", e.target.value)}
              placeholder={conference.dates}
            />
            <DashInput
              label="Venue"
              value={content.venue ?? ""}
              onChange={(e) => updateContent("venue", e.target.value)}
              placeholder={conference.venue}
            />
          </div>
        </section>

        <section className="dash-card p-6 space-y-6">
          <SectionHeader
            icon={HiOutlineCursorArrowRays}
            title="Call-to-action buttons"
            description="Primary and secondary buttons below the hero stats."
          />

          <div className="grid sm:grid-cols-2 gap-4">
            {(content.ctas ?? []).map((cta, i) => (
              <CtaEditor key={cta.id ?? i} cta={cta} index={i} onUpdate={(patch) => updateCta(i, patch)} />
            ))}
          </div>
        </section>

        <section className="dash-card p-6 space-y-6">
          <SectionHeader
            icon={HiOutlinePhoto}
            title="Hero background"
            description="Full-width background behind the homepage hero text. Default: public/assets/hr_bg.jpeg."
          />

          <div className="space-y-4 max-w-xl">
            <ImageUpload
              label="Upload background"
              value={form.image.src}
              onChange={(url) => {
                setForm((f) => ({ ...f, image: { ...f.image, src: url } }));
                setMessage("");
              }}
              folder={CLOUDINARY_FOLDERS.hero}
              previewClassName="h-40 w-full object-cover rounded-xl bg-dash-bg/30"
              hint="Recommended: landscape photo (16:9 or wider). JPG or WebP, max 10 MB."
            />
           
          </div>
        </section>

        <section className="dash-card p-6 space-y-6">
          <SectionHeader
            icon={HiOutlineChartBar}
            title="Highlight stats"
            description="Up to four stat cards below the hero text. Toggle off any stat to hide it on the homepage."
          />

          <div className="grid sm:grid-cols-2 gap-4">
            {form.highlights.map((stat, i) => {
              const enabled = isHighlightEnabled(stat);
              const toggleId = `hero-stat-toggle-${i}`;

              return (
                <div
                  key={i}
                  className={`rounded-xl border p-4 space-y-4 transition-colors duration-200 ${
                    enabled
                      ? "border-dash-border bg-white hover:border-dash-primary/20"
                      : "border-dash-border/80 bg-dash-bg/40 opacity-75"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <DashToggle
                        id={toggleId}
                        enabled={enabled}
                        onChange={(next) => updateHighlight(i, "enabled", next)}
                        ariaLabel={enabled ? "Stat visible on homepage" : "Stat hidden on homepage"}
                      />
                      <div>
                        <label
                          htmlFor={toggleId}
                          className="text-xs font-semibold uppercase tracking-wider text-dash-text cursor-pointer"
                        >
                          Stat {i + 1}
                        </label>
                        <p className="text-[11px] text-dash-muted mt-0.5">
                          {enabled ? "Visible on homepage" : "Hidden on homepage"}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                        enabled
                          ? "bg-blue-50 text-dash-primary"
                          : "bg-slate-100 text-dash-muted"
                      }`}
                    >
                      {enabled ? "On" : "Off"}
                    </span>
                  </div>

                  <div
                    className={`rounded-xl border px-4 py-3 shadow-sm transition-opacity duration-200 ${
                      enabled
                        ? "border-border bg-white/80"
                        : "border-dash-border bg-white/50 opacity-50"
                    }`}
                    aria-hidden={!enabled}
                  >
                    <p className="text-lg font-bold text-primary tabular-nums">
                      {stat.value || "—"}
                    </p>
                    <p className="text-xs font-medium text-dash-muted mt-0.5 truncate">
                      {stat.label || "Label"}
                    </p>
                  </div>

                  <div className="space-y-3 pt-1 border-t border-dash-border">
                    <DashInput
                      label="Value"
                      value={stat.value}
                      onChange={(e) => updateHighlight(i, "value", e.target.value)}
                      placeholder="Springer"
                      disabled={!enabled}
                    />
                    <DashInput
                      label="Label"
                      value={stat.label}
                      onChange={(e) => updateHighlight(i, "label", e.target.value)}
                      placeholder="CCIS Proceedings"
                      disabled={!enabled}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {!isDirty && (
          <div className="flex justify-end">
            <DashButton type="submit" disabled={saving || !isDirty}>
              {saving ? "Saving…" : "Save hero section"}
            </DashButton>
          </div>
        )}
      </form>

      {isDirty && (
        <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-dash-border bg-white/95 backdrop-blur-md px-4 py-3 sm:px-6 lg:left-64">
          <div className="mx-auto flex max-w-4xl items-center justify-between gap-4">
            <p className="text-sm font-medium text-dash-text">You have unsaved changes</p>
            <div className="flex items-center gap-3">
              <DashButton
                type="button"
                variant="secondary"
                onClick={() => {
                  setForm(savedSnapshot);
                  setMessage("");
                }}
              >
                Discard
              </DashButton>
              <DashButton type="submit" form="hero-form" disabled={saving}>
                {saving ? "Saving…" : "Save changes"}
              </DashButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
