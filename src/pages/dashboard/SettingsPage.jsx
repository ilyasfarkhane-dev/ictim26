import { useState } from "react";
import DashButton from "../../components/dashboard/DashButton";
import { DashInput, DashTextarea } from "../../components/dashboard/DashInput";
import { useConference } from "../../hooks/useConference";
import { upsertSetting } from "../../lib/contentApi";

export default function SettingsPage() {
  const { conference, refresh } = useConference();
  const [form, setForm] = useState({ ...conference });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      await upsertSetting("conference", form);
      await refresh();
      setMessage("Settings saved successfully.");
    } catch (err) {
      setMessage(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-dash-text">Conference Settings</h1>
        <p className="mt-1 text-sm text-dash-muted">General conference information shown across the site</p>
      </div>

      <form onSubmit={handleSave} className="dash-card p-6 space-y-4 max-w-2xl">
        <div className="grid sm:grid-cols-2 gap-4">
          <DashInput
            label="Short name"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
          />
          <DashInput
            label="Edition"
            type="number"
            value={form.edition}
            onChange={(e) => update("edition", Number(e.target.value))}
          />
        </div>
        <DashInput
          label="Full name"
          value={form.fullName}
          onChange={(e) => update("fullName", e.target.value)}
        />
        <DashTextarea
          label="Tagline"
          value={form.tagline}
          onChange={(e) => update("tagline", e.target.value)}
        />
        <DashTextarea
          label="Description"
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
          rows={3}
        />
        <div className="grid sm:grid-cols-2 gap-4">
          <DashInput
            label="Dates"
            value={form.dates}
            onChange={(e) => update("dates", e.target.value)}
          />
          <DashInput
            label="City"
            value={form.city}
            onChange={(e) => update("city", e.target.value)}
          />
        </div>
        <DashInput
          label="Venue"
          value={form.venue}
          onChange={(e) => update("venue", e.target.value)}
        />
        <DashInput
          label="Organizer"
          value={form.organizer}
          onChange={(e) => update("organizer", e.target.value)}
        />
        <div className="grid sm:grid-cols-2 gap-4">
          <DashInput
            label="Registration URL"
            value={form.registrationUrl}
            onChange={(e) => update("registrationUrl", e.target.value)}
          />
          <DashInput
            label="Website URL"
            value={form.websiteUrl}
            onChange={(e) => update("websiteUrl", e.target.value)}
          />
        </div>
        <DashInput
          label="Contact email"
          value={form.contact?.emails?.[0] ?? ""}
          onChange={(e) =>
            update("contact", { ...form.contact, emails: [e.target.value, form.contact?.emails?.[1]].filter(Boolean) })
          }
        />
        <DashInput
          label="Contact phone"
          value={form.contact?.phone ?? ""}
          onChange={(e) => update("contact", { ...form.contact, phone: e.target.value })}
        />

        {message && (
          <p className={`text-sm ${message.includes("success") ? "text-dash-success" : "text-red-600"}`}>
            {message}
          </p>
        )}

        <DashButton type="submit" disabled={saving}>
          {saving ? "Saving…" : "Save settings"}
        </DashButton>
      </form>
    </div>
  );
}
