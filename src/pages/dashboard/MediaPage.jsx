import { useState } from "react";
import DashButton from "../../components/dashboard/DashButton";
import ImageUpload from "../../components/dashboard/ImageUpload";
import { useConference } from "../../hooks/useConference";
import { upsertSetting } from "../../lib/contentApi";
import { CLOUDINARY_FOLDERS } from "../../lib/cloudinary";

export default function MediaPage() {
  const { conference, refresh } = useConference();
  const [logoUrl, setLogoUrl] = useState(conference.logoUrl ?? "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      await upsertSetting("conference", { ...conference, logoUrl });
      await refresh();
      setMessage("Logo saved successfully.");
    } catch (err) {
      setMessage(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-dash-text">Media Library</h1>
        <p className="mt-1 text-sm text-dash-muted">
          Site logo and brand assets
        </p>
      </div>

      <form onSubmit={handleSave} className="dash-card p-6 space-y-4 max-w-lg">
        <ImageUpload
          label="Conference logo"
          value={logoUrl}
          onChange={setLogoUrl}
          folder={CLOUDINARY_FOLDERS.general}
          previewClassName="h-20 w-auto max-w-full object-contain rounded-xl bg-dash-bg p-2"
          hint="Leave empty to use the default TIM logo. Hero images are managed under the Hero tab."
        />

        {message && (
          <p className={`text-sm ${message.includes("success") ? "text-dash-success" : "text-red-600"}`}>
            {message}
          </p>
        )}

        <DashButton type="submit" disabled={saving}>
          {saving ? "Saving…" : "Save logo"}
        </DashButton>
      </form>
    </div>
  );
}
