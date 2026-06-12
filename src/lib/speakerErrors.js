const ENABLED_COLUMN_HINT =
  "Database update required: open Supabase → SQL Editor and run supabase/migrations/add_speakers_enabled.sql (adds speakers.enabled column).";

/** User-facing message when Supabase is missing speakers.enabled. */
export function formatSpeakerSaveError(message) {
  if (
    typeof message === "string" &&
    message.includes("enabled") &&
    message.includes("speakers")
  ) {
    return ENABLED_COLUMN_HINT;
  }
  return message;
}

export { ENABLED_COLUMN_HINT };
