import { useEffect, useMemo, useState } from "react";
import {
  HiOutlinePlus,
  HiOutlineTrash,
  HiOutlineChevronUp,
  HiOutlineChevronDown,
  HiOutlineArrowTopRightOnSquare,
} from "react-icons/hi2";
import DashButton from "../../components/dashboard/DashButton";
import DashToggle from "../../components/dashboard/DashToggle";
import StatusBanner from "../../components/dashboard/StatusBanner";
import LineListEditor from "../../components/dashboard/LineListEditor";
import { DashInput, DashTextarea } from "../../components/dashboard/DashInput";
import { useConference } from "../../hooks/useConference";
import { upsertSetting } from "../../lib/contentApi";
import { withBase } from "../../config/paths";
import {
  emptyColumn,
  emptyLink,
  getVisibleFooterColumns,
  hydrateFooterForEdit,
  prepareFooterForSave,
} from "../../lib/footer";

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

function LinkRow({ link, index, total, onUpdate, onRemove, onMoveUp, onMoveDown }) {
  return (
    <div
      className={`rounded-lg border p-3 space-y-3 ${
        link.enabled === false ? "border-dashed border-dash-border opacity-75" : "border-dash-border bg-white"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold text-dash-text">Link {index + 1}</p>
        <DashToggle
          id={`footer-link-${link.id}`}
          enabled={link.enabled !== false}
          onChange={(enabled) => onUpdate({ enabled })}
          ariaLabel={link.enabled !== false ? "Hide link" : "Show link"}
        />
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <DashInput
          label="Label"
          value={link.label ?? ""}
          onChange={(e) => onUpdate({ label: e.target.value })}
          placeholder="Registration"
        />
        <DashInput
          label="URL"
          value={link.href ?? ""}
          onChange={(e) => onUpdate({ href: e.target.value })}
          placeholder="#register-pricing or https://…"
        />
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMoveUp}
          disabled={index === 0}
          className="p-1.5 rounded-lg text-dash-muted hover:text-dash-primary hover:bg-blue-50/80 disabled:opacity-30 cursor-pointer dash-focus-ring"
          aria-label="Move link up"
        >
          <HiOutlineChevronUp className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={onMoveDown}
          disabled={index >= total - 1}
          className="p-1.5 rounded-lg text-dash-muted hover:text-dash-primary hover:bg-blue-50/80 disabled:opacity-30 cursor-pointer dash-focus-ring"
          aria-label="Move link down"
        >
          <HiOutlineChevronDown className="w-4 h-4" />
        </button>
        {total > 1 && (
          <button
            type="button"
            onClick={onRemove}
            className="inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-700 cursor-pointer dash-focus-ring"
          >
            <HiOutlineTrash className="w-3.5 h-3.5" />
            Remove
          </button>
        )}
      </div>
    </div>
  );
}

function ColumnEditor({ column, index, total, onUpdate, onRemove, onMoveUp, onMoveDown }) {
  const links = column.links ?? [];

  const updateLink = (linkIndex, patch) => {
    onUpdate({
      links: links.map((link, i) => (i === linkIndex ? { ...link, ...patch } : link)),
    });
  };

  return (
    <div
      className={`rounded-xl border overflow-hidden ${
        column.enabled === false ? "border-dashed border-dash-border opacity-80" : "border-dash-border"
      }`}
    >
      <div className="flex items-stretch bg-dash-bg/30">
        <div className="flex-1 p-4 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-bold uppercase tracking-wider text-dash-primary">
              Column {index + 1}
            </p>
            <DashToggle
              id={`footer-col-${column.id}`}
              enabled={column.enabled !== false}
              onChange={(enabled) => onUpdate({ enabled })}
              ariaLabel={column.enabled !== false ? "Hide column" : "Show column"}
            />
          </div>
          <DashInput
            label="Column title"
            value={column.title ?? ""}
            onChange={(e) => onUpdate({ title: e.target.value })}
            placeholder="Practical Links"
          />
        </div>
        <div className="flex flex-col border-l border-dash-border">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={index === 0}
            className="flex-1 px-2.5 text-dash-muted hover:text-dash-primary hover:bg-blue-50/80 disabled:opacity-30 cursor-pointer dash-focus-ring"
            aria-label="Move column up"
          >
            <HiOutlineChevronUp className="w-4 h-4 mx-auto" />
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={index >= total - 1}
            className="flex-1 px-2.5 text-dash-muted hover:text-dash-primary hover:bg-blue-50/80 disabled:opacity-30 cursor-pointer dash-focus-ring border-t border-dash-border"
            aria-label="Move column down"
          >
            <HiOutlineChevronDown className="w-4 h-4 mx-auto" />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-3 border-t border-dash-border">
        {links.map((link, linkIndex) => (
          <LinkRow
            key={link.id ?? linkIndex}
            link={link}
            index={linkIndex}
            total={links.length}
            onUpdate={(patch) => updateLink(linkIndex, patch)}
            onRemove={() => {
              if (links.length <= 1) return;
              onUpdate({ links: links.filter((_, i) => i !== linkIndex) });
            }}
            onMoveUp={() => onUpdate({ links: moveItem(links, linkIndex, -1) })}
            onMoveDown={() => onUpdate({ links: moveItem(links, linkIndex, 1) })}
          />
        ))}
        <DashButton
          type="button"
          variant="secondary"
          onClick={() => onUpdate({ links: [...links, emptyLink(index)] })}
        >
          <HiOutlinePlus className="w-4 h-4" />
          Add link
        </DashButton>
        {total > 1 && (
          <button
            type="button"
            onClick={onRemove}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-red-600 hover:text-red-700 cursor-pointer dash-focus-ring"
          >
            <HiOutlineTrash className="w-4 h-4" />
            Remove column
          </button>
        )}
      </div>
    </div>
  );
}

export default function FooterPage() {
  const { footer: liveFooter, conference, refresh } = useConference();
  const [form, setForm] = useState(() => hydrateFooterForEdit(liveFooter, conference));
  const [savedForm, setSavedForm] = useState(() => hydrateFooterForEdit(liveFooter, conference));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const next = hydrateFooterForEdit(liveFooter, conference);
    setForm(next);
    setSavedForm(cloneForm(next));
  }, [liveFooter, conference]);

  const isDirty = useMemo(
    () =>
      JSON.stringify(prepareFooterForSave(form)) !==
      JSON.stringify(prepareFooterForSave(savedForm)),
    [form, savedForm]
  );

  const stats = useMemo(() => {
    const saved = prepareFooterForSave(form);
    const columns = getVisibleFooterColumns(saved);
    const links = columns.reduce((n, col) => n + col.links.length, 0);
    return {
      columns: columns.length,
      links,
      emails: (saved.contact.emails ?? []).filter(Boolean).length,
    };
  }, [form]);

  const handleDiscard = () => {
    setForm(cloneForm(savedForm));
    setMessage("");
  };

  const handleSave = async (e) => {
    e?.preventDefault?.();
    setSaving(true);
    setMessage("");
    try {
      const payload = prepareFooterForSave(form);
      await upsertSetting("footer", payload);
      const hydrated = hydrateFooterForEdit(payload, conference);
      await refresh();
      setForm(hydrated);
      setSavedForm(cloneForm(hydrated));
      setMessage("Footer saved successfully.");
    } catch (err) {
      setMessage(err.message);
    } finally {
      setSaving(false);
    }
  };

  const updateColumn = (index, patch) => {
    setForm((prev) => ({
      ...prev,
      columns: prev.columns.map((col, i) => (i === index ? { ...col, ...patch } : col)),
    }));
  };

  return (
    <div className={isDirty ? "pb-24" : ""}>
      <div className="mb-6 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-dash-muted mb-1">
            Homepage
          </p>
          <h1 className="text-2xl font-bold text-dash-text">Footer</h1>
          <p className="mt-1 text-sm text-dash-muted max-w-xl">
            Manage footer description, link columns, contact details, and copyright line.
          </p>
        </div>
        <a
          href={`${withBase("/")}#contact`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-xl border border-dash-border bg-white px-4 py-2.5 text-sm font-medium text-dash-text hover:bg-blue-50/80 transition-colors duration-200 cursor-pointer dash-focus-ring shrink-0"
        >
          View on site
          <HiOutlineArrowTopRightOnSquare className="w-4 h-4 text-dash-primary" />
        </a>
      </div>

      {message && (
        <div className="mb-6">
          <StatusBanner message={message} />
        </div>
      )}

      <div className="mb-6 grid grid-cols-3 gap-3 max-w-lg">
        <div className="dash-card px-4 py-3 text-center">
          <p className="text-lg font-bold text-dash-text tabular-nums">{stats.columns}</p>
          <p className="text-xs text-dash-muted mt-0.5">Columns</p>
        </div>
        <div className="dash-card px-4 py-3 text-center">
          <p className="text-lg font-bold text-dash-text tabular-nums">{stats.links}</p>
          <p className="text-xs text-dash-muted mt-0.5">Links</p>
        </div>
        <div className="dash-card px-4 py-3 text-center">
          <p className="text-lg font-bold text-dash-text tabular-nums">{stats.emails}</p>
          <p className="text-xs text-dash-muted mt-0.5">Emails</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="dash-card p-5 sm:p-6 space-y-8 max-w-3xl">
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-dash-text">Brand &amp; copyright</h2>
            <DashTextarea
              label="About text (under logo)"
              hint="Leave empty to auto-generate from conference name, organizer, and location."
              value={form.about ?? ""}
              onChange={(e) => setForm({ ...form, about: e.target.value })}
              rows={3}
            />
            <DashInput
              label="Copyright line (optional)"
              hint={`Default: © ${new Date().getFullYear()} ${conference.name}. All Rights Reserved.`}
              value={form.copyright ?? ""}
              onChange={(e) => setForm({ ...form, copyright: e.target.value })}
            />
          </section>

          <section className="space-y-4 pt-6 border-t border-dash-border">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h2 className="text-lg font-bold text-dash-text">Link columns</h2>
              <DashButton
                type="button"
                variant="secondary"
                onClick={() =>
                  setForm((prev) => ({ ...prev, columns: [...prev.columns, emptyColumn()] }))
                }
              >
                <HiOutlinePlus className="w-4 h-4" />
                Add column
              </DashButton>
            </div>
            <div className="space-y-4">
              {form.columns.map((column, index) => (
                <ColumnEditor
                  key={column.id ?? index}
                  column={column}
                  index={index}
                  total={form.columns.length}
                  onUpdate={(patch) => updateColumn(index, patch)}
                  onRemove={() => {
                    if (form.columns.length <= 1) return;
                    if (!window.confirm("Remove this column?")) return;
                    setForm((prev) => ({
                      ...prev,
                      columns: prev.columns.filter((_, i) => i !== index),
                    }));
                  }}
                  onMoveUp={() =>
                    setForm((prev) => ({
                      ...prev,
                      columns: moveItem(prev.columns, index, -1),
                    }))
                  }
                  onMoveDown={() =>
                    setForm((prev) => ({
                      ...prev,
                      columns: moveItem(prev.columns, index, 1),
                    }))
                  }
                />
              ))}
            </div>
          </section>

          <section className="space-y-4 pt-6 border-t border-dash-border">
            <h2 className="text-lg font-bold text-dash-text">Contact block</h2>
            <DashInput
              label="Section title"
              value={form.contactTitle ?? ""}
              onChange={(e) => setForm({ ...form, contactTitle: e.target.value })}
            />
            <DashTextarea
              label="Address"
              value={form.contact?.address ?? ""}
              onChange={(e) =>
                setForm({ ...form, contact: { ...form.contact, address: e.target.value } })
              }
              rows={2}
            />
            <DashInput
              label="Phone"
              value={form.contact?.phone ?? ""}
              onChange={(e) =>
                setForm({ ...form, contact: { ...form.contact, phone: e.target.value } })
              }
            />
            <LineListEditor
              label="Email addresses"
              items={form.contact?.emails ?? [""]}
              onChange={(emails) =>
                setForm({ ...form, contact: { ...form.contact, emails } })
              }
              placeholder="tim24fsbm@gmail.com"
            />
          </section>

          <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-dash-border">
            <DashButton type="submit" disabled={saving || !isDirty}>
              {saving ? "Saving…" : "Save changes"}
            </DashButton>
            {isDirty && (
              <DashButton type="button" variant="secondary" onClick={handleDiscard}>
                Discard
              </DashButton>
            )}
          </div>
      </form>

      {isDirty && (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-dash-border bg-white/95 backdrop-blur-md px-4 py-3 sm:px-6 lg:left-64">
          <div className="flex flex-wrap items-center justify-between gap-3 max-w-5xl">
            <p className="text-sm text-dash-text">Unsaved footer changes</p>
            <div className="flex items-center gap-2">
              <DashButton type="button" variant="secondary" onClick={handleDiscard}>
                Discard
              </DashButton>
              <DashButton type="button" disabled={saving} onClick={handleSave}>
                {saving ? "Saving…" : "Save changes"}
              </DashButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
