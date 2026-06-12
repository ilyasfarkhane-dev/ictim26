import { useEffect } from "react";
import { HiOutlineXMark } from "react-icons/hi2";

export default function Modal({
  open,
  onClose,
  title,
  titleId,
  children,
  wide = false,
}) {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 cursor-pointer bg-navy/50 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close dialog"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-2xl border border-border bg-white shadow-premium sm:max-h-[90vh] sm:rounded-2xl ${
          wide ? "max-w-2xl" : "max-w-lg"
        }`}
      >
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-border px-5 py-4 sm:px-6 sm:py-5">
          {title ? (
            <h2 id={titleId} className="text-lg font-bold text-navy sm:text-xl">
              {title}
            </h2>
          ) : (
            <span id={titleId} className="sr-only">
              Dialog
            </span>
          )}
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 cursor-pointer rounded-lg p-2 text-text-secondary transition-colors duration-200 hover:bg-section hover:text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2"
            aria-label="Close"
          >
            <HiOutlineXMark className="h-5 w-5" />
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">{children}</div>
      </div>
    </div>
  );
}
