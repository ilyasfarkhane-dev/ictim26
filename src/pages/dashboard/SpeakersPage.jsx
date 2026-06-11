import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  HiOutlineUserGroup,
  HiOutlinePlus,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineBars3,
  HiOutlineArrowTopRightOnSquare,
  HiOutlineMagnifyingGlass,
  HiOutlineDocumentDuplicate,
  HiOutlineChevronUp,
  HiOutlineChevronDown,
} from "react-icons/hi2";
import DashButton from "../../components/dashboard/DashButton";
import DashToggle from "../../components/dashboard/DashToggle";
import StatusBanner from "../../components/dashboard/StatusBanner";
import DashModal from "../../components/dashboard/DashModal";
import { DashInput, DashTextarea } from "../../components/dashboard/DashInput";
import ImageUpload from "../../components/dashboard/ImageUpload";
import CloudinaryImage from "../../components/CloudinaryImage";
import { useConference } from "../../hooks/useConference";
import {
  createRow,
  updateRow,
  deleteRow,
  reorderRows,
} from "../../lib/contentApi";
import { CLOUDINARY_FOLDERS } from "../../lib/cloudinary";
import { isPersistedId } from "../../lib/ids";
import { speakerToRow } from "../../lib/mappers";
import { withBase } from "../../config/paths";
import { isSpeakerEnabled, normalizeSpeakers } from "../../lib/speakers";

const emptySpeaker = () => ({
  name: "",
  position: "",
  company: "",
  bio: "",
  image: "",
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
  const from = next.findIndex((s) => s.id === fromId);
  const to = next.findIndex((s) => s.id === toId);
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

export default function SpeakersPage() {
  const { speakers, refresh } = useConference();
  const [ordered, setOrdered] = useState(() => normalizeSpeakers(speakers));
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [draggingId, setDraggingId] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);
  const [reordering, setReordering] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptySpeaker());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const orderedRef = useRef(ordered);
  orderedRef.current = ordered;

  const canReorder = !search.trim() && filter === "all";

  useEffect(() => {
    setOrdered(normalizeSpeakers(speakers));
  }, [speakers]);

  const stats = useMemo(() => {
    const all = normalizeSpeakers(ordered);
    const visible = all.filter((s) => s.enabled).length;
    return { total: all.length, visible, hidden: all.length - visible };
  }, [ordered]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return ordered.filter((s) => {
      if (filter === "visible" && !s.enabled) return false;
      if (filter === "hidden" && s.enabled) return false;
      if (!q) return true;
      return (
        s.name.toLowerCase().includes(q) ||
        s.position.toLowerCase().includes(q) ||
        s.company.toLowerCase().includes(q)
      );
    });
  }, [ordered, search, filter]);

  const persistOrder = useCallback(
    async (list) => {
      setReordering(true);
      try {
        await reorderRows("speakers", list.map((s) => s.id));
        await refresh();
        setMessage("Speaker order updated.");
      } catch (err) {
        setMessage(err.message);
        setOrdered(normalizeSpeakers(speakers));
      } finally {
        setReordering(false);
      }
    },
    [refresh, speakers]
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

  const toggleEnabled = async (speaker) => {
    const next = !speaker.enabled;
    setOrdered((prev) =>
      prev.map((s) => (s.id === speaker.id ? { ...s, enabled: next } : s))
    );
    if (!isPersistedId(speaker.id)) return;
    try {
      await updateRow("speakers", speaker.id, { enabled: next });
      await refresh();
      setMessage(next ? "Speaker is now visible on the site." : "Speaker hidden from the site.");
    } catch (err) {
      setMessage(err.message);
      await refresh();
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptySpeaker());
    setError("");
    setModalOpen(true);
  };

  const openEdit = (speaker) => {
    setEditing(speaker);
    setForm({ ...speaker });
    setError("");
    setModalOpen(true);
  };

  const openDuplicate = (speaker) => {
    setEditing(null);
    setForm({
      ...speaker,
      name: `${speaker.name} (copy)`,
      enabled: false,
    });
    setError("");
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const row = speakerToRow(form, ordered.length);
      const { sort_order: _sort, ...updates } = row;

      if (editing?.id && isPersistedId(editing.id)) {
        await updateRow("speakers", editing.id, updates);
      } else {
        await createRow("speakers", row);
      }
      await refresh();
      setModalOpen(false);
      setMessage("Speaker saved successfully.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (speaker) => {
    if (!window.confirm(`Delete "${speaker.name}"?`)) return;
    if (!isPersistedId(speaker.id)) return;
    try {
      await deleteRow("speakers", speaker.id);
      await refresh();
      setMessage("Speaker deleted.");
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-dash-muted mb-1">
            Homepage
          </p>
          <h1 className="text-2xl font-bold text-dash-text">Speakers</h1>
          <p className="mt-1 text-sm text-dash-muted max-w-xl">
            Manage keynote speakers — drag to reorder, toggle visibility, or edit details.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <a
            href={`${withBase("/")}#speakers`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-dash-border bg-white px-4 py-2.5 text-sm font-medium text-dash-text hover:bg-blue-50/80 transition-colors duration-200 cursor-pointer dash-focus-ring"
          >
            View on site
            <HiOutlineArrowTopRightOnSquare className="w-4 h-4 text-dash-primary" aria-hidden="true" />
          </a>
          <DashButton onClick={openCreate}>
            <HiOutlinePlus className="w-4 h-4" />
            Add speaker
          </DashButton>
        </div>
      </div>

      {message && (
        <div className="mb-6">
          <StatusBanner message={message} />
        </div>
      )}

      {/* Stats */}
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

      {/* Toolbar */}
      <div className="mb-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dash-muted" />
          <input
            type="search"
            placeholder="Search by name, role, or affiliation…"
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
          Clear search and set filter to &quot;All&quot; to drag and reorder speakers.
        </p>
      )}

      {/* Speaker list */}
      <div className="dash-card overflow-hidden">
        {filtered.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <HiOutlineUserGroup className="mx-auto w-10 h-10 text-dash-muted/50 mb-3" />
            <p className="text-sm text-dash-muted">
              {ordered.length === 0
                ? "No speakers yet. Add your first speaker."
                : "No speakers match your search or filter."}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-dash-border">
            {filtered.map((speaker) => {
              const globalIndex = ordered.findIndex((s) => s.id === speaker.id);
              const enabled = isSpeakerEnabled(speaker);
              const isDragging = draggingId === speaker.id;
              const isDropTarget = dragOverId === speaker.id && draggingId !== speaker.id;

              return (
                <li
                  key={speaker.id}
                  draggable={canReorder}
                  onDragStart={() => canReorder && handleDragStart(speaker.id)}
                  onDragOver={(e) => canReorder && handleDragOver(e, speaker.id)}
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
                    aria-label={`Drag to reorder ${speaker.name}`}
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    <HiOutlineBars3 className="w-5 h-5" />
                  </button>

                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-dash-border bg-dash-bg">
                    {speaker.image ? (
                      <CloudinaryImage
                        src={speaker.image}
                        alt=""
                        width={112}
                        height={112}
                        className="h-full w-full object-cover object-top"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-dash-muted">
                        <HiOutlineUserGroup className="w-6 h-6" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-dash-text truncate">{speaker.name}</p>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                          enabled
                            ? "bg-blue-50 text-dash-primary"
                            : "bg-slate-100 text-dash-muted"
                        }`}
                      >
                        {enabled ? "Visible" : "Hidden"}
                      </span>
                    </div>
                    <p className="text-sm text-dash-primary truncate">{speaker.position}</p>
                    <p className="text-xs text-dash-muted truncate mt-0.5">{speaker.company}</p>
                  </div>

                  <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                    <DashToggle
                      id={`speaker-toggle-${speaker.id}`}
                      enabled={enabled}
                      onChange={() => toggleEnabled(speaker)}
                      ariaLabel={`${enabled ? "Hide" : "Show"} ${speaker.name} on website`}
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
                      onClick={() => openDuplicate(speaker)}
                      className="p-2 rounded-lg text-dash-muted hover:bg-blue-50 hover:text-dash-primary transition-colors duration-200 cursor-pointer dash-focus-ring"
                      aria-label="Duplicate"
                    >
                      <HiOutlineDocumentDuplicate className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => openEdit(speaker)}
                      className="p-2 rounded-lg text-dash-muted hover:bg-blue-50 hover:text-dash-primary transition-colors duration-200 cursor-pointer dash-focus-ring"
                      aria-label="Edit"
                    >
                      <HiOutlinePencilSquare className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(speaker)}
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
        Drag rows to reorder · Disabled speakers stay in the list but are hidden on the public site
      </p>

      <DashModal
        title={editing ? "Edit speaker" : "Add speaker"}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        wide
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="flex items-center justify-between gap-4 rounded-xl border border-dash-border bg-dash-bg/40 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-dash-text">Show on website</p>
              <p className="text-xs text-dash-muted mt-0.5">
                {form.enabled !== false ? "Visible in speakers section" : "Hidden from public site"}
              </p>
            </div>
            <DashToggle
              id="speaker-form-enabled"
              enabled={form.enabled !== false}
              onChange={(v) => setForm({ ...form, enabled: v })}
            />
          </div>

          <DashInput
            label="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <DashInput
            label="Position"
            value={form.position}
            onChange={(e) => setForm({ ...form, position: e.target.value })}
          />
          <DashInput
            label="Affiliation"
            value={form.company}
            onChange={(e) => setForm({ ...form, company: e.target.value })}
          />
          <ImageUpload
            label="Photo"
            value={form.image}
            onChange={(url) => setForm({ ...form, image: url })}
            folder={CLOUDINARY_FOLDERS.speakers}
            previewClassName="h-40 w-full object-cover object-top rounded-xl"
            required
          />
          <DashTextarea
            label="Bio"
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            rows={4}
          />

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <DashButton variant="secondary" type="button" onClick={() => setModalOpen(false)}>
              Cancel
            </DashButton>
            <DashButton type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save speaker"}
            </DashButton>
          </div>
        </form>
      </DashModal>
    </div>
  );
}
