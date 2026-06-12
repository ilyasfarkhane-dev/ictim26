import CloudinaryImage from "./CloudinaryImage";
import Modal from "./Modal";

function speakerInitial(name) {
  return (name?.trim()?.[0] ?? "?").toUpperCase();
}

export default function SpeakerBioModal({ speaker, open, onClose }) {
  if (!speaker) return null;

  const titleId = `speaker-modal-${speaker.id}`;
  const hasImage = Boolean(speaker.image?.trim());
  const bio =
    speaker.bio?.trim() ||
    "Biography will be published soon. Please check back closer to the conference date.";

  return (
    <Modal open={open} onClose={onClose} title={speaker.name} titleId={titleId} wide>
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
        <div className="mx-auto aspect-[3/4] w-full max-w-[220px] shrink-0 overflow-hidden rounded-2xl border border-border bg-section sm:mx-0">
          {hasImage ? (
            <CloudinaryImage
              src={speaker.image}
              alt={speaker.name}
              width={440}
              height={560}
              crop="fit"
              className="h-full w-full object-cover object-top"
            />
          ) : (
            <div
              className="flex h-full min-h-[280px] items-center justify-center bg-gradient-to-br from-light-blue to-primary/10"
              aria-hidden="true"
            >
              <span className="text-5xl font-bold text-primary/40">
                {speakerInitial(speaker.name)}
              </span>
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          {speaker.position?.trim() && (
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">
              {speaker.position}
            </p>
          )}
          {speaker.company?.trim() && (
            <p className="mt-2 text-sm leading-relaxed text-text-secondary">
              {speaker.company}
            </p>
          )}
          <div className="mt-5 border-t border-border pt-5">
            <h3 className="text-sm font-semibold text-navy">Biography</h3>
            <p className="mt-3 text-base leading-relaxed text-text-secondary">{bio}</p>
          </div>
        </div>
      </div>
    </Modal>
  );
}
