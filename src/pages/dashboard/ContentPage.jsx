import { useEffect, useState } from "react";
import DashButton from "../../components/dashboard/DashButton";
import { DashTextarea } from "../../components/dashboard/DashInput";
import { useConference } from "../../hooks/useConference";
import { upsertSetting } from "../../lib/contentApi";

const sections = [
  { key: "call_for_papers", label: "Call for Papers", field: "callForPapers" },
  { key: "submission_guidelines", label: "Submission Guidelines", field: "submissionGuidelines" },
  { key: "registration_pricing", label: "Registration Pricing", field: "registrationPricing" },
  { key: "hero_highlights", label: "Hero Highlights", field: "heroHighlights" },
];

export default function ContentPage() {
  const data = useConference();
  const [active, setActive] = useState(sections[0].key);
  const [json, setJson] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const loadSection = (section) => {
    setActive(section.key);
    setJson(JSON.stringify(data[section.field], null, 2));
    setMessage("");
  };

  useEffect(() => {
    const section = sections.find((s) => s.key === active) ?? sections[0];
    setJson(JSON.stringify(data[section.field], null, 2));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, data.source]);

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    try {
      const parsed = JSON.parse(json);
      await upsertSetting(active, parsed);
      await data.refresh();
      setMessage("Content saved successfully.");
    } catch (err) {
      setMessage(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-dash-text">Site Content</h1>
        <p className="mt-1 text-sm text-dash-muted">
          Edit structured content blocks (JSON format)
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {sections.map((section) => (
          <button
            key={section.key}
            type="button"
            onClick={() => loadSection(section)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
              active === section.key
                ? "bg-dash-primary text-white"
                : "bg-white border border-dash-border text-dash-muted hover:text-dash-text"
            }`}
          >
            {section.label}
          </button>
        ))}
      </div>

      <div className="dash-card p-6">
        <DashTextarea
          label="JSON content"
          value={json}
          onChange={(e) => setJson(e.target.value)}
          rows={20}
          className="font-mono text-xs"
        />
        {message && (
          <p className={`mt-3 text-sm ${message.includes("success") ? "text-emerald-600" : "text-red-600"}`}>
            {message}
          </p>
        )}
        <div className="mt-4">
          <DashButton onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : "Save content"}
          </DashButton>
        </div>
      </div>
    </div>
  );
}
