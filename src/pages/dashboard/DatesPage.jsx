import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  HiOutlineCalendarDays,
  HiOutlinePlus,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineBars3,
  HiOutlineArrowTopRightOnSquare,
  HiOutlineMagnifyingGlass,
  HiOutlineDocumentDuplicate,
  HiOutlineChevronUp,
  HiOutlineChevronDown,
  HiOutlineDocumentText,
  HiOutlineCheckCircle,
  HiOutlinePencil,
  HiOutlineArrowUpTray,
} from "react-icons/hi2";
import DashButton from "../../components/dashboard/DashButton";
import DashToggle from "../../components/dashboard/DashToggle";
import StatusBanner from "../../components/dashboard/StatusBanner";
import DashModal from "../../components/dashboard/DashModal";
import { DashInput, DashTextarea } from "../../components/dashboard/DashInput";
import { useConference } from "../../hooks/useConference";
import {
  createRow,
  updateRow,
  deleteRow,
  reorderRows,
  lookupPersistedId,
} from "../../lib/contentApi";
import { isPersistedId } from "../../lib/ids";
import { dateToRow } from "../../lib/mappers";
import { withBase } from "../../config/paths";
import { isDateEnabled, normalizeDate, normalizeDates } from "../../lib/dates";

const ICON_OPTIONS = [
  { id: "calendar", label: "Calendar", Icon: HiOutlineCalendarDays },
  { id: "document", label: "Document", Icon: HiOutlineDocumentText },
  { id: "check", label: "Check", Icon: HiOutlineCheckCircle },
  { id: "edit", label: "Edit", Icon: HiOutlinePencil },
  { id: "search", label: "Upload", Icon: HiOutlineArrowUpTray },
];

const iconMap = Object.fromEntries(ICON_OPTIONS.map((o) => [o.id, o.Icon]));

const emptyDate = () => ({
  step: "",
  title: "",
  date: "",
  description: "",
  icon: "calendar",
  enabled: true,
});

const FILTERS = [
  { id: "all", label: "All" },
  { id: "visible", label: "Visible" },
  { id: "hidden", label: "Hidden" },
];

function reorderList(list, fromId, toId) {
  if (fromId === toId) return list;
  const next = [...list];
  const from = next.findIndex((d) => d.id === fromId);
  const to = next.findIndex((d) => d.id === toId);
  if (from < 0 || to < 0) return list;
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

function moveItem(list, index, direction) {
  const target = index + direction;
  if (target < 0 || target >= list.length) return list;
  const next = [...list];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

function formatDateError(message) {
  if (
    typeof message === "string" &&
    message.includes("enabled") &&
    message.includes("important_dates")
  ) {
    return "Database update required: run supabase/migrations/add_dates_enabled.sql in Supabase SQL Editor.";
  }
  return message;
}

async function resolveDateId(item) {
  if (!item) return null;
  if (item.id && isPersistedId(item.id)) return item.id;
  return lookupPersistedId("important_dates", item);
}

export default function DatesPage() {
  const { participationSteps, refresh } = useConference();
  const [ordered, setOrdered] = useState(() => normalizeDates(participationSteps));
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [draggingId, setDraggingId] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);
  const [reordering, setReordering] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingDateId, setEditingDateId] = useState(null);
  const editingDateIdRef = useRef(null);
  const [form, setForm] = useState(emptyDate());
  const [saving, setSaving] = useState(false);
  const [resolvingId, setResolvingId] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [togglingId, setTogglingId] = useState(null);
  const skipNextSyncRef = useRef(false);
  const orderedRef = useRef(ordered);
  orderedRef.current = ordered;

  const canReorder = !search.trim() && filter === "all";

  useEffect(() => {
    if (skipNextSyncRef.current) {
      skipNextSyncRef.current = false;
      return;
    }
    setOrdered(normalizeDates(participationSteps));
  }, [participationSteps]);

  const stats = useMemo(() => {
    const all = normalizeDates(ordered);
    const visible = all.filter((d) => d.enabled).length;
    return { total: all.length, visible, hidden: all.length - visible };
  }, [ordered]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return ordered.filter((d) => {
      if (filter === "visible" && !d.enabled) return false;
      if (filter === "hidden" && d.enabled) return false;
      if (!q) return true;
      return (
        d.title.toLowerCase().includes(q) ||
        d.date.toLowerCase().includes(q) ||
        d.step.toLowerCase().includes(q)
      );
    });
  }, [ordered, search, filter]);

  const persistOrder = useCallback(
    async (list) => {
      setReordering(true);
      try {
        await reorderRows("important_dates", list.map((d) => d.id));
        await refresh();
        setMessage("Date order updated.");
      } catch (err) {
        setMessage(err.message);
        setOrdered(normalizeDates(participationSteps));
      } finally {
        setReordering(false);
      }
    },
    [refresh, participationSteps]
  );

  const handleDragStart = (id) => setDraggingId(id);

  const handleDragOver = (e, targetId) => {
    e.preventDefault();
    if (!draggingId || draggingId === targetId) return;
    setDragOverId(targetId);
    setOrdered((prev) => reorderList(prev, draggingId, targetId));
  };

  const handleDragEnd = async () => {
    setDraggingId(null);
    setDragOverId(null);
    if (!canReorder) return;
    await persistOrder(orderedRef.current);
  };

  const handleMove = async (index, direction) => {
    const next = moveItem(ordered, index, direction);
    setOrdered(next);
    await persistOrder(next);
  };

  const toggleEnabled = async (item, next) => {
    if (togglingId === item.id) return;

    const previous = isDateEnabled(item);
    const rowId = isPersistedId(item.id) ? item.id : null;

    setTogglingId(item.id);
    setOrdered((prev) =>
      prev.map((d) => (d.id === item.id ? { ...d, enabled: next } : d))
    );

    try {
      const id = rowId ?? (await resolveDateId(item));
      if (!id) {
        throw new Error("Could not find this milestone in the database. Refresh and try again.");
      }

      const updated = await updateRow("important_dates", id, { enabled: next });
      const normalized = normalizeDate(updated);

      setOrdered((prev) =>
        prev.map((d) => (d.id === item.id || d.id === normalized.id ? normalized : d))
      );
      skipNextSyncRef.current = true;
      refresh();
      setMessage(next ? "Milestone is now visible on the site." : "Milestone hidden from the site.");
    } catch (err) {
      setOrdered((prev) =>
        prev.map((d) => (d.id === item.id ? { ...d, enabled: previous } : d))
      );
      setMessage(formatDateError(err.message));
    } finally {
      setTogglingId(null);
    }
  };

  const openCreate = () => {
    setIsEditing(false);
    setEditingDateId(null);
    editingDateIdRef.current = null;
    setForm(emptyDate());
    setError("");
    setModalOpen(true);
  };

  const openEdit = async (item) => {
    setIsEditing(true);
    setForm({ ...item });
    setError("");
    setModalOpen(true);
    setResolvingId(true);

    try {
      const id = await resolveDateId(item);
      editingDateIdRef.current = id;
      setEditingDateId(id);
      if (!id) {
        setError("Could not link this milestone to the database. Refresh and try again.");
      }
    } finally {
      setResolvingId(false);
    }
  };

  const openDuplicate = (item) => {
    setIsEditing(false);
    setEditingDateId(null);
    editingDateIdRef.current = null;
    setForm({
      ...item,
      id: undefined,
      title: `${item.title} (copy)`,
      enabled: false,
    });
    setError("");
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setIsEditing(false);
    setEditingDateId(null);
    editingDateIdRef.current = null;
    setError("");
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.title?.trim()) {
      setError("Please enter a milestone title.");
      return;
    }

    setSaving(true);
    try {
      const row = dateToRow(form, ordered.length);
      const { sort_order: _sort, ...updates } = row;

      if (isEditing) {
        let id =
          editingDateIdRef.current ??
          editingDateId ??
          (form.id && isPersistedId(form.id) ? form.id : null);

        if (!id) {
          id = await lookupPersistedId("important_dates", form);
        }

        if (!id) {
          throw new Error("Could not find this milestone in the database. Refresh the page and try again.");
        }

        await updateRow("important_dates", id, updates);
      } else {
        await createRow("important_dates", row);
      }
      await refresh();
      closeModal();
      setMessage("Milestone saved successfully.");
    } catch (err) {
      setError(formatDateError(err.message));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete "${item.title}"?`)) return;
    try {
      const id = await resolveDateId(item);
      if (!id) return;
      await deleteRow("important_dates", id);
      await refresh();
      setMessage("Milestone deleted.");
    } catch (err) {
      setMessage(formatDateError(err.message));
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-dash-muted mb-1">
            Homepage
          </p>
          <h1 className="text-2xl font-bold text-dash-text">Important Dates</h1>
          <p className="mt-1 text-sm text-dash-muted max-w-xl">
            Manage submission deadlines and conference milestones — drag to reorder or toggle visibility.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <a
            href={`${withBase("/")}#important-dates`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-dash-border bg-white px-4 py-2.5 text-sm font-medium text-dash-text hover:bg-blue-50/80 hover:border-dash-primary/30 transition-colors duration-200 cursor-pointer dash-focus-ring"
          >
            View on site
            <HiOutlineArrowTopRightOnSquare className="w-4 h-4 text-dash-primary" aria-hidden="true" />
          </a>
          <DashButton onClick={openCreate}>
            <HiOutlinePlus className="w-4 h-4" />
            Add milestone
          </DashButton>
        </div>
      </div>

      {message && (
        <div className="mb-6">
          <StatusBanner message={message} />
        </div>
      )}

      <div className="mb-6 grid grid-cols-3 gap-3 max-w-lg">
        {[
          { label: "Total", value: stats.total },
          { label: "Visible", value: stats.visible },
          { label: "Hidden", value: stats.hidden },
        ].map((stat) => (
          <div key={stat.label} className="dash-card px-4 py-3 text-center">
            <p className="text-xl font-bold text-dash-text tabular-nums">{stat.value}</p>
            <p className="text-xs text-dash-muted mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="mb-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dash-muted" />
          <input
            type="search"
            placeholder="Search by title, date, or step…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-dash-border bg-white pl-10 pr-4 py-2.5 text-sm text-dash-text placeholder:text-dash-muted focus:outline-none focus:ring-2 focus:ring-dash-primary/30 dash-focus-ring"
          />
        </div>
        <div className="flex rounded-xl border border-dash-border bg-white p-1">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-200 cursor-pointer dash-focus-ring ${
                filter === f.id
                  ? "bg-dash-primary text-white"
                  : "text-dash-muted hover:text-dash-text hover:bg-blue-50/80"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {reordering && (
        <p className="mb-3 text-xs font-medium text-dash-primary">Saving order…</p>
      )}

      {!canReorder && ordered.length > 0 && (
        <p className="mb-3 text-xs text-dash-muted">
          Clear search and set filter to &quot;All&quot; to drag and reorder milestones.
        </p>
      )}

      <div className="dash-card overflow-hidden">
        {filtered.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <HiOutlineCalendarDays className="mx-auto w-10 h-10 text-dash-muted/50 mb-3" />
            <p className="text-sm text-dash-muted">
              {ordered.length === 0
                ? "No milestones yet. Add your first important date."
                : "No milestones match your search or filter."}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-dash-border">
            {filtered.map((item) => {
              const globalIndex = ordered.findIndex((d) => d.id === item.id);
              const enabled = isDateEnabled(item);
              const isDragging = draggingId === item.id;
              const isDropTarget = dragOverId === item.id && draggingId !== item.id;
              const StepIcon = iconMap[item.icon] ?? HiOutlineCalendarDays;
              const isLastVisible =
                enabled && !ordered.slice(globalIndex + 1).some((d) => d.enabled);

              return (
                <li
                  key={item.id}
                  draggable={canReorder}
                  onDragStart={() => canReorder && handleDragStart(item.id)}
                  onDragOver={(e) => canReorder && handleDragOver(e, item.id)}
                  onDragEnd={() => canReorder && handleDragEnd()}
                  className={`flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-4 transition-colors duration-200 ${
                    isDragging ? "opacity-40 bg-blue-50/50" : ""
                  } ${isDropTarget ? "bg-blue-50/80 ring-2 ring-inset ring-dash-primary/30" : "hover:bg-blue-50/30"} ${
                    !enabled ? "opacity-70" : ""
                  }`}
                >
                  <button
                    type="button"
                    disabled={!canReorder}
                    className={`shrink-0 p-1.5 rounded-lg text-dash-muted dash-focus-ring ${
                      canReorder
                        ? "hover:text-dash-text cursor-grab active:cursor-grabbing"
                        : "opacity-30 cursor-not-allowed"
                    }`}
                    aria-label={`Drag to reorder ${item.title}`}
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    <HiOutlineBars3 className="w-5 h-5" />
                  </button>

                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                      isLastVisible ? "bg-dash-primary text-white" : "bg-blue-50 text-dash-primary"
                    }`}
                  >
                    <StepIcon className="w-5 h-5" aria-hidden="true" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      {item.step && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-dash-primary">
                          Step {item.step}
                        </span>
                      )}
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                          enabled
                            ? "bg-blue-50 text-dash-primary"
                            : "bg-slate-100 text-dash-muted"
                        }`}
                      >
                        {enabled ? "Visible" : "Hidden"}
                      </span>
                      {isLastVisible && (
                        <span className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide bg-dash-primary/10 text-dash-primary">
                          Featured
                        </span>
                      )}
                    </div>
                    <p className="font-semibold text-dash-text truncate">{item.title}</p>
                    <p className="text-sm text-dash-primary truncate">{item.date}</p>
                    {item.description && (
                      <p className="text-xs text-dash-muted truncate mt-0.5">{item.description}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                    <DashToggle
                      id={`date-toggle-${item.id}`}
                      enabled={enabled}
                      disabled={togglingId === item.id}
                      onChange={(next) => toggleEnabled(item, next)}
                      ariaLabel={`${enabled ? "Hide" : "Show"} ${item.title} on website`}
                    />

                    <div className="hidden sm:flex flex-col gap-0.5">
                      <button
                        type="button"
                        disabled={globalIndex === 0 || reordering}
                        onClick={() => handleMove(globalIndex, -1)}
                        className="p-1 rounded-md text-dash-muted hover:bg-blue-50 hover:text-dash-primary transition-colors duration-200 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed dash-focus-ring"
                        aria-label="Move up"
                      >
                        <HiOutlineChevronUp className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        disabled={globalIndex === ordered.length - 1 || reordering}
                        onClick={() => handleMove(globalIndex, 1)}
                        className="p-1 rounded-md text-dash-muted hover:bg-blue-50 hover:text-dash-primary transition-colors duration-200 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed dash-focus-ring"
                        aria-label="Move down"
                      >
                        <HiOutlineChevronDown className="w-4 h-4" />
                      </button>
                    </div>

                   
                    <button
                      type="button"
                      onClick={() => openEdit(item)}
                      className="p-2 rounded-lg text-dash-muted hover:bg-blue-50 hover:text-dash-primary transition-colors duration-200 cursor-pointer dash-focus-ring"
                      aria-label="Edit"
                    >
                      <HiOutlinePencilSquare className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(item)}
                      className="p-2 rounded-lg text-dash-muted hover:bg-red-50 hover:text-red-600 transition-colors duration-200 cursor-pointer dash-focus-ring"
                      aria-label="Delete"
                    >
                      <HiOutlineTrash className="w-4 h-4" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <p className="mt-3 text-xs text-dash-muted">
        Drag rows to reorder · The last visible milestone is highlighted on the homepage timeline
      </p>

      <DashModal
        title={isEditing ? "Edit milestone" : "Add milestone"}
        open={modalOpen}
        onClose={closeModal}
        wide
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="flex items-center justify-between gap-4 rounded-xl border border-dash-border bg-dash-bg/40 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-dash-text">Show on website</p>
              <p className="text-xs text-dash-muted mt-0.5">
                {form.enabled !== false ? "Visible in timeline" : "Hidden from public site"}
              </p>
            </div>
            <DashToggle
              id="date-form-enabled"
              enabled={form.enabled !== false}
              onChange={(v) => setForm({ ...form, enabled: v })}
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <DashInput
              label="Step number"
              value={form.step}
              onChange={(e) => setForm({ ...form, step: e.target.value })}
              placeholder="01"
            />
            <DashInput
              label="Date label"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              placeholder="September 30, 2026"
              required
            />
          </div>

          <DashInput
            label="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Submission Deadline"
            required
          />

          <div className="space-y-2">
            <span className="block text-sm font-medium text-dash-text">Icon</span>
            <div className="flex flex-wrap gap-2">
              {ICON_OPTIONS.map(({ id, label, Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setForm({ ...form, icon: id })}
                  className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition-colors duration-200 cursor-pointer dash-focus-ring ${
                    form.icon === id
                      ? "border-dash-primary bg-blue-50 text-dash-primary"
                      : "border-dash-border bg-white text-dash-muted hover:border-dash-primary/30 hover:text-dash-text"
                  }`}
                >
                  <Icon className="w-4 h-4" aria-hidden="true" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          <DashTextarea
            label="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
            placeholder="Brief description for this milestone…"
          />

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <DashButton variant="secondary" type="button" onClick={closeModal}>
              Cancel
            </DashButton>
            <DashButton type="submit" disabled={saving || resolvingId}>
              {saving ? "Saving…" : resolvingId ? "Loading…" : "Save milestone"}
            </DashButton>
          </div>
        </form>
      </DashModal>
    </div>
  );
}
