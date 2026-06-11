import { useEffect, useState } from "react";
import DashButton from "../../components/dashboard/DashButton";
import { DashInput } from "../../components/dashboard/DashInput";
import ImageUpload from "../../components/dashboard/ImageUpload";
import CloudinaryImage from "../../components/CloudinaryImage";
import { useConference } from "../../hooks/useConference";
import { upsertSetting } from "../../lib/contentApi";
import { CLOUDINARY_FOLDERS } from "../../lib/cloudinary";
import { withBase } from "../../config/paths";

export default function HeroPage() {
  const { heroImages, heroHighlights, refresh } = useConference();
  const [form, setForm] = useState({
    main: { ...heroImages.main },
    secondary: heroImages.secondary.map((img) => ({ ...img })),
    highlights: heroHighlights.map((h) => ({ ...h })),
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setForm({
      main: { ...heroImages.main },
      secondary: heroImages.secondary.map((img) => ({ ...img })),
      highlights: heroHighlights.map((h) => ({ ...h })),
    });
  }, [heroImages, heroHighlights]);

  const updateSecondary = (index, field, value) => {
    setForm((f) => ({
      ...f,
      secondary: f.secondary.map((img, i) =>
        i === index ? { ...img, [field]: value } : img
      ),
    }));
  };

  const updateHighlight = (index, field, value) => {
    setForm((f) => ({
      ...f,
      highlights: f.highlights.map((h, i) =>
        i === index ? { ...h, [field]: value } : h
      ),
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      await Promise.all([
        upsertSetting("hero_images", {
          main: form.main,
          secondary: form.secondary,
        }),
        upsertSetting("hero_highlights", form.highlights),
      ]);
      await refresh();
      setMessage("Hero section saved successfully.");
    } catch (err) {
      setMessage(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-dash-text">Hero Management</h1>
        <p className="mt-1 text-sm text-dash-muted">
          Manage the homepage hero images and highlight stats
        </p>
      </div>

      <div className="grid xl:grid-cols-[1fr_320px] gap-8 items-start">
        <form onSubmit={handleSave} className="space-y-6">
          <section className="dash-card p-6 space-y-4">
            <h2 className="text-lg font-bold text-dash-text">Main hero image</h2>
            <p className="text-sm text-dash-muted">
              Large image on the left side of the hero section.
            </p>
            <ImageUpload
              value={form.main.src}
              onChange={(url) => setForm((f) => ({ ...f, main: { ...f.main, src: url } }))}
              folder={CLOUDINARY_FOLDERS.hero}
            />
            <DashInput
              label="Alt text"
              value={form.main.alt}
              onChange={(e) =>
                setForm((f) => ({ ...f, main: { ...f.main, alt: e.target.value } }))
              }
            />
          </section>

          <section className="dash-card p-6 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-dash-text">Secondary images</h2>
              <p className="mt-1 text-sm text-dash-muted">
                Three stacked images on the right side of the hero.
              </p>
            </div>
            {form.secondary.map((img, i) => (
              <div
                key={i}
                className="pt-5 border-t border-dash-border first:pt-0 first:border-0 space-y-3"
              >
                <p className="text-sm font-semibold text-dash-text">Image {i + 1}</p>
                <ImageUpload
                  value={img.src}
                  onChange={(url) => updateSecondary(i, "src", url)}
                  folder={CLOUDINARY_FOLDERS.hero}
                />
                <DashInput
                  label="Alt text"
                  value={img.alt}
                  onChange={(e) => updateSecondary(i, "alt", e.target.value)}
                />
              </div>
            ))}
          </section>

          <section className="dash-card p-6 space-y-4">
            <div>
              <h2 className="text-lg font-bold text-dash-text">Highlight stats</h2>
              <p className="mt-1 text-sm text-dash-muted">
                Four stat cards shown below the hero text.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {form.highlights.map((stat, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-dash-border bg-dash-bg/50 p-4 space-y-3"
                >
                  <p className="text-xs font-semibold uppercase tracking-wider text-dash-muted">
                    Stat {i + 1}
                  </p>
                  <DashInput
                    label="Value"
                    value={stat.value}
                    onChange={(e) => updateHighlight(i, "value", e.target.value)}
                    placeholder="Springer"
                  />
                  <DashInput
                    label="Label"
                    value={stat.label}
                    onChange={(e) => updateHighlight(i, "label", e.target.value)}
                    placeholder="CCIS Proceedings"
                  />
                </div>
              ))}
            </div>
          </section>

          {message && (
            <p
              className={`text-sm ${message.includes("success") ? "text-emerald-600" : "text-red-600"}`}
            >
              {message}
            </p>
          )}

          <DashButton type="submit" disabled={saving}>
            {saving ? "Saving…" : "Save hero section"}
          </DashButton>
        </form>

        <aside className="dash-card p-5 xl:sticky xl:top-28 space-y-4">
          <h2 className="text-sm font-bold text-dash-text">Live preview</h2>
          <div className="rounded-xl overflow-hidden border border-dash-border bg-dash-bg">
            <div className="grid grid-cols-5 gap-1 p-2 h-48">
              <div className="col-span-3 row-span-1 rounded-lg overflow-hidden bg-slate-200">
                {form.main.src && (
                  <CloudinaryImage
                    src={form.main.src}
                    alt=""
                    width={200}
                    height={200}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div className="col-span-2 grid grid-rows-3 gap-1">
                {form.secondary.map((img, i) => (
                  <div key={i} className="rounded-lg overflow-hidden bg-slate-200">
                    {img.src && (
                      <CloudinaryImage
                        src={img.src}
                        alt=""
                        width={100}
                        height={60}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 p-3 border-t border-dash-border">
              {form.highlights.map((stat, i) => (
                <div
                  key={i}
                  className="rounded-lg bg-white border border-dash-border px-2 py-1.5 text-center"
                >
                  <p className="text-xs font-bold text-dash-primary">{stat.value || "—"}</p>
                  <p className="text-[10px] text-dash-muted truncate">{stat.label || "Label"}</p>
                </div>
              ))}
            </div>
          </div>
          <a
            href={`${withBase("/")}#home`}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-center text-sm font-medium text-dash-primary hover:underline cursor-pointer"
          >
            View on website →
          </a>
        </aside>
      </div>
    </div>
  );
}
