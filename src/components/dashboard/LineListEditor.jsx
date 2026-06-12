import { HiOutlinePlus, HiOutlineTrash } from "react-icons/hi2";

export default function LineListEditor({
  label,
  hint,
  items = [],
  onChange,
  placeholder = "Enter an item…",
  addLabel = "Add item",
}) {
  const list = items.length > 0 ? items : [""];

  const updateLine = (index, value) => {
    const next = list.map((item, i) => (i === index ? value : item));
    onChange(next);
  };

  const removeLine = (index) => {
    const next = list.filter((_, i) => i !== index);
    onChange(next.length > 0 ? next : [""]);
  };

  const addLine = () => {
    onChange([...list, ""]);
  };

  const filledCount = list.filter((line) => line.trim()).length;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        {label && (
          <span className="text-sm font-medium text-dash-text">{label}</span>
        )}
        <span className="text-xs text-dash-muted tabular-nums shrink-0">
          {filledCount} item{filledCount === 1 ? "" : "s"}
        </span>
      </div>

      <ul className="space-y-2">
        {list.map((line, index) => (
          <li key={index} className="flex items-center gap-2">
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-xs font-bold text-dash-primary tabular-nums"
              aria-hidden="true"
            >
              {index + 1}
            </span>
            <input
              type="text"
              value={line}
              onChange={(e) => updateLine(index, e.target.value)}
              placeholder={placeholder}
              className="flex-1 min-w-0 rounded-xl border border-dash-border bg-white px-3 py-2 text-sm text-dash-text placeholder:text-dash-muted focus:outline-none focus:ring-2 focus:ring-dash-primary/30 focus:border-dash-primary transition-colors duration-200 dash-focus-ring"
            />
            <button
              type="button"
              onClick={() => removeLine(index)}
              disabled={list.length === 1 && !line.trim()}
              className="p-2 rounded-lg text-dash-muted hover:bg-red-50 hover:text-red-600 transition-colors duration-200 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed dash-focus-ring"
              aria-label={`Remove item ${index + 1}`}
            >
              <HiOutlineTrash className="w-4 h-4" />
            </button>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={addLine}
        className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-dash-border px-3 py-2 text-xs font-medium text-dash-primary hover:bg-blue-50/80 hover:border-dash-primary/30 transition-colors duration-200 cursor-pointer dash-focus-ring"
      >
        <HiOutlinePlus className="w-4 h-4" aria-hidden="true" />
        {addLabel}
      </button>

      {hint && <p className="text-xs text-dash-muted leading-relaxed">{hint}</p>}
    </div>
  );
}

/** Trim empty lines before save. */
export function normalizeLineList(items) {
  return (items ?? []).map((line) => line.trim()).filter(Boolean);
}
