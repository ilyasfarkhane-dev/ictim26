import { useEffect, useMemo, useState } from "react";
import {
  HiOutlinePlus,
  HiOutlineTrash,
  HiOutlineChevronUp,
  HiOutlineChevronDown,
  HiOutlineArrowTopRightOnSquare,
  HiOutlineRectangleStack,
} from "react-icons/hi2";
import DashButton from "../../components/dashboard/DashButton";
import DashToggle from "../../components/dashboard/DashToggle";
import StatusBanner from "../../components/dashboard/StatusBanner";
import { DashInput } from "../../components/dashboard/DashInput";
import { useConference } from "../../hooks/useConference";
import { upsertSetting } from "../../lib/contentApi";
import { withBase } from "../../config/paths";
import {
  emptyEditionItem,
  getVisibleEditionItems,
  hydrateEditionsDropdownForEdit,
  prepareEditionsDropdownForSave,
} from "../../lib/previousEditions";

function cloneForm(value) {
  return JSON.parse(JSON.stringify(value));
}

function moveItem(list, index, direction) {
  const target = index + direction;
  if (target < 0 || target >= list.length) return list;
  const next = [...list];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

function EditionRow({ item, index, total, onUpdate, onRemove, onMoveUp, onMoveDown }) {
  const enabled = item.enabled !== false;

  return (
    <div
      className={`rounded-xl border overflow-hidden transition-colors duration-200 ${
        enabled
          ? "border-dash-border bg-white hover:border-dash-primary/20"
          : "border-dashed border-dash-border bg-dash-bg/40 opacity-80"
      }`}
    >
      <div className="flex items-stretch">
        <div className="flex-1 p-4 space-y-3 min-w-0">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-bold uppercase tracking-wider text-dash-primary">
              Edition {index + 1}
              {!enabled && (
                <span className="ml-2 normal-case font-medium text-dash-muted">(hidden)</span>
              )}
            </p>
            <DashToggle
              id={`edition-toggle-${item.id}`}
              enabled={enabled}
              onChange={(next) => onUpdate({ enabled: next })}
              ariaLabel={enabled ? "Hide edition in navbar" : "Show edition in navbar"}
            />
          </div>

          <div className="rounded-lg border border-dash-border bg-dash-bg/20 px-3 py-2.5">
            <p className="text-sm font-semibold text-dash-text truncate">
              {item.label || "Edition name"}
            </p>
            {item.subtitle && (
              <p className="text-xs text-dash-muted mt-0.5 truncate">{item.subtitle}</p>
            )}
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <DashInput
              label="Name"
              value={item.label ?? ""}
              onChange={(e) => onUpdate({ label: e.target.value })}
              placeholder="TIM'14"
              disabled={!enabled}
            />
            <DashInput
              label="Subtitle"
              value={item.subtitle ?? ""}
              onChange={(e) => onUpdate({ subtitle: e.target.value })}
              placeholder="1st Edition"
              disabled={!enabled}
            />
          </div>
          <DashInput
            label="URL"
            value={item.href ?? ""}
            onChange={(e) => onUpdate({ href: e.target.value })}
            placeholder="https://www.conference-tim.com/"
            disabled={!enabled}
          />
        </div>

        <div className="flex flex-col border-l border-dash-border shrink-0">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={index === 0}
            className="flex-1 px-2.5 text-dash-muted hover:text-dash-primary hover:bg-blue-50/80 disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-200 cursor-pointer dash-focus-ring"
            aria-label="Move edition up"
          >
            <HiOutlineChevronUp className="w-4 h-4 mx-auto" />
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={index >= total - 1}
            className="flex-1 px-2.5 text-dash-muted hover:text-dash-primary hover:bg-blue-50/80 disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-200 cursor-pointer dash-focus-ring"
            aria-label="Move edition down"
          >
            <HiOutlineChevronDown className="w-4 h-4 mx-auto" />
          </button>
          {total > 1 && (
            <button
              type="button"
              onClick={onRemove}
              className="px-2.5 py-3 text-red-600 hover:bg-red-50 transition-colors duration-200 cursor-pointer dash-focus-ring"
              aria-label="Remove edition"
            >
              <HiOutlineTrash className="w-4 h-4 mx-auto" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function EditionsPage() {
  const { editionsDropdownAdmin, refresh } = useConference();
  const [form, setForm] = useState(() => hydrateEditionsDropdownForEdit(editionsDropdownAdmin));
  const [savedForm, setSavedForm] = useState(() => hydrateEditionsDropdownForEdit(editionsDropdownAdmin));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const next = hydrateEditionsDropdownForEdit(editionsDropdownAdmin);
    setForm(next);
    setSavedForm(cloneForm(next));
  }, [editionsDropdownAdmin]);

  const isDirty = useMemo(
    () =>
      JSON.stringify(prepareEditionsDropdownForSave(form)) !==
      JSON.stringify(prepareEditionsDropdownForSave(savedForm)),
    [form, savedForm]
  );

  const stats = useMemo(() => {
    const items = form.items ?? [];
    const visible = getVisibleEditionItems(items);
    return { total: items.length, visible: visible.length };
  }, [form]);

  const updateItem = (index, patch) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    }));
    setMessage("");
  };

  const handleSave = async (e) => {
    e?.preventDefault?.();
    setSaving(true);
    setMessage("");
    try {
      const payload = prepareEditionsDropdownForSave(form);
      await upsertSetting("previous_editions", payload);
      const hydrated = hydrateEditionsDropdownForEdit(payload);
      await refresh();
      setForm(hydrated);
      setSavedForm(cloneForm(hydrated));
      setMessage("Previous editions saved successfully.");
    } catch (err) {
      setMessage(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={isDirty ? "pb-24" : ""}>
      <div className="mb-6 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-dash-muted mb-1">
            Navigation
          </p>
          <h1 className="text-2xl font-bold text-dash-text">Previous Editions</h1>
          <p className="mt-1 text-sm text-dash-muted max-w-xl">
            Manage the navbar dropdown listing past conference editions — names, subtitles, links,
            and visibility.
          </p>
        </div>
        <a
          href={withBase("/")}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-xl border border-dash-border bg-white px-4 py-2.5 text-sm font-medium text-dash-text hover:bg-blue-50/80 transition-colors duration-200 cursor-pointer dash-focus-ring shrink-0"
        >
          View on site
          <HiOutlineArrowTopRightOnSquare className="w-4 h-4 text-dash-primary" />
        </a>
      </div>

      {message && (
        <div className="mb-6 max-w-3xl">
          <StatusBanner message={message} />
        </div>
      )}

      <div className="mb-6 grid grid-cols-2 gap-3 max-w-xs">
        <div className="dash-card px-4 py-3 text-center">
          <p className="text-lg font-bold text-dash-text tabular-nums">{stats.visible}</p>
          <p className="text-xs text-dash-muted mt-0.5">Visible</p>
        </div>
        <div className="dash-card px-4 py-3 text-center">
          <p className="text-lg font-bold text-dash-text tabular-nums">{stats.total}</p>
          <p className="text-xs text-dash-muted mt-0.5">Total</p>
        </div>
      </div>

      <form id="editions-form" onSubmit={handleSave} className="dash-card p-5 sm:p-6 space-y-6 max-w-3xl">
        <section className="space-y-4">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-dash-primary">
              <HiOutlineRectangleStack className="w-5 h-5" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-dash-text">Dropdown label</h2>
              <p className="mt-1 text-sm text-dash-muted">
                Text shown on the navbar button that opens the editions menu.
              </p>
            </div>
          </div>
          <DashInput
            label="Menu label"
            value={form.label ?? ""}
            onChange={(e) => {
              setForm((prev) => ({ ...prev, label: e.target.value }));
              setMessage("");
            }}
            placeholder="Previous Editions"
          />
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-dash-text">Editions</h2>
              <p className="mt-1 text-sm text-dash-muted">
                Order matches the dropdown on desktop and mobile navigation.
              </p>
            </div>
            <DashButton
              type="button"
              variant="secondary"
              onClick={() => {
                setForm((prev) => ({
                  ...prev,
                  items: [...(prev.items ?? []), emptyEditionItem(prev.items?.length ?? 0)],
                }));
                setMessage("");
              }}
            >
              <HiOutlinePlus className="w-4 h-4" />
              Add edition
            </DashButton>
          </div>

          <div className="space-y-3">
            {(form.items ?? []).map((item, index) => (
              <EditionRow
                key={item.id}
                item={item}
                index={index}
                total={form.items.length}
                onUpdate={(patch) => updateItem(index, patch)}
                onRemove={() => {
                  setForm((prev) => ({
                    ...prev,
                    items: prev.items.filter((_, i) => i !== index),
                  }));
                  setMessage("");
                }}
                onMoveUp={() => {
                  setForm((prev) => ({ ...prev, items: moveItem(prev.items, index, -1) }));
                  setMessage("");
                }}
                onMoveDown={() => {
                  setForm((prev) => ({ ...prev, items: moveItem(prev.items, index, 1) }));
                  setMessage("");
                }}
              />
            ))}
          </div>
        </section>

        {!isDirty && (
          <div className="flex justify-end pt-2">
            <DashButton type="submit" disabled={saving || !isDirty}>
              {saving ? "Saving…" : "Save editions"}
            </DashButton>
          </div>
        )}
      </form>

      {isDirty && (
        <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-dash-border bg-white/95 backdrop-blur-md px-4 py-3 sm:px-6 lg:left-64">
          <div className="mx-auto flex max-w-3xl items-center justify-between gap-4">
            <p className="text-sm font-medium text-dash-text">You have unsaved changes</p>
            <div className="flex items-center gap-3">
              <DashButton
                type="button"
                variant="secondary"
                onClick={() => {
                  setForm(cloneForm(savedForm));
                  setMessage("");
                }}
              >
                Discard
              </DashButton>
              <DashButton type="submit" form="editions-form" disabled={saving}>
                {saving ? "Saving…" : "Save changes"}
              </DashButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
