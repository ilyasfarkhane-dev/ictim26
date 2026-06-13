import { useId, useRef, useState } from "react";
import {
  HiOutlineDocumentArrowUp,
  HiOutlineArrowDownTray,
  HiOutlineChevronDown,
  HiOutlineCheckCircle,
} from "react-icons/hi2";
import DashButton from "./DashButton";

export default function ExcelImport({
  title = "Import from Excel",
  description,
  formatGuide,
  accept = ".xlsx,.xls,.csv",
  onImport,
  onDownloadTemplate,
  disabled = false,
  defaultOpen = false,
}) {
  const inputId = useId();
  const inputRef = useRef(null);
  const [open, setOpen] = useState(defaultOpen);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [warnings, setWarnings] = useState([]);
  const [mode, setMode] = useState("replace");
  const [dragOver, setDragOver] = useState(false);

  const processFile = async (file) => {
    if (!file) return;

    setLoading(true);
    setError("");
    setSuccess("");
    setWarnings([]);
    try {
      const result = await onImport(file, { mode });
      const summary =
        typeof result === "string"
          ? result
          : result?.message ||
            `"${file.name}" imported. Review the list below, then save to publish.`;
      setSuccess(summary);
      setWarnings(Array.isArray(result?.warnings) ? result.warnings : []);
    } catch (err) {
      setError(err.message || "Import failed. Check your file format and try again.");
    } finally {
      setLoading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    await processFile(file);
  };

  const handleDrop = async (event) => {
    event.preventDefault();
    setDragOver(false);
    if (disabled || loading) return;
    const file = event.dataTransfer.files?.[0];
    await processFile(file);
  };

  return (
    <div className="rounded-xl border border-dash-border bg-dash-bg/30 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors duration-200 hover:bg-white/60 cursor-pointer dash-focus-ring"
        aria-expanded={open}
      >
        <div className="flex items-center gap-2 min-w-0">
          <HiOutlineDocumentArrowUp className="w-5 h-5 shrink-0 text-dash-primary" aria-hidden="true" />
          <span className="text-sm font-semibold text-dash-text">{title}</span>
          {!open && (
            <span className="hidden sm:inline text-xs text-dash-muted truncate">
              — bulk import from .xlsx or .csv
            </span>
          )}
        </div>
        <HiOutlineChevronDown
          className={`w-4 h-4 shrink-0 text-dash-muted transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div className="border-t border-dash-border px-4 pb-4 pt-3 space-y-4">
          {description && (
            <p className="text-xs text-dash-muted leading-relaxed">{description}</p>
          )}

          {formatGuide && (
            <details className="rounded-lg border border-dash-border bg-white group">
              <summary className="cursor-pointer px-3 py-2 text-xs font-semibold text-dash-text list-none flex items-center justify-between dash-focus-ring">
                File format guide
                <HiOutlineChevronDown
                  className="w-3.5 h-3.5 text-dash-muted group-open:rotate-180 transition-transform duration-200"
                  aria-hidden="true"
                />
              </summary>
              <div className="border-t border-dash-border px-3 py-2.5 text-xs text-dash-muted leading-relaxed space-y-1.5">
                {formatGuide}
              </div>
            </details>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-medium text-dash-text">Import mode</span>
            <div className="inline-flex rounded-lg border border-dash-border bg-white p-0.5">
              {[
                { id: "replace", label: "Replace list", hint: "Overwrites current tab or all committees" },
                { id: "append", label: "Append rows", hint: "Adds imported rows after existing members" },
              ].map((option) => (
                <button
                  key={option.id}
                  type="button"
                  title={option.hint}
                  onClick={() => setMode(option.id)}
                  className={`cursor-pointer rounded-md px-3 py-1.5 text-xs font-semibold transition-colors duration-200 dash-focus-ring ${
                    mode === option.id
                      ? "bg-dash-primary text-white"
                      : "text-dash-muted hover:text-dash-text"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div
            onDragOver={(e) => {
              e.preventDefault();
              if (!disabled && !loading) setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`rounded-xl border-2 border-dashed transition-colors duration-200 ${
              dragOver
                ? "border-dash-primary bg-blue-50/80"
                : "border-dash-border bg-white"
            } ${disabled || loading ? "opacity-50" : ""}`}
          >
            <input
              ref={inputRef}
              id={inputId}
              type="file"
              accept={accept}
              disabled={disabled || loading}
              onChange={handleFile}
              className="sr-only"
            />
            <label
              htmlFor={inputId}
              className={`flex flex-col items-center justify-center gap-2 px-4 py-8 text-center transition-colors duration-200 ${
                disabled || loading ? "cursor-not-allowed" : "cursor-pointer hover:bg-blue-50/40"
              }`}
            >
              <HiOutlineDocumentArrowUp
                className={`w-8 h-8 ${dragOver ? "text-dash-primary" : "text-dash-muted"}`}
                aria-hidden="true"
              />
              <span className="text-sm font-medium text-dash-text">
                {loading ? "Importing…" : "Drop file here or click to browse"}
              </span>
              <span className="text-xs text-dash-muted">.xlsx, .xls, or .csv</span>
            </label>
          </div>

          {onDownloadTemplate && (
            <DashButton type="button" variant="secondary" size="sm" onClick={onDownloadTemplate}>
              <HiOutlineArrowDownTray className="w-4 h-4" aria-hidden="true" />
              Download template
            </DashButton>
          )}

          {success && (
            <p className="flex items-start gap-2 text-sm text-green-700" role="status">
              <HiOutlineCheckCircle className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
              {success}
            </p>
          )}

          {warnings.length > 0 && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-900">
              <p className="font-semibold mb-1">Rows skipped during import</p>
              <ul className="list-disc pl-4 space-y-0.5 leading-relaxed">
                {warnings.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            </div>
          )}

          {error && (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
