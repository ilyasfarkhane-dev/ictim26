import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  HiOutlineTag,
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
import { DashInput } from "../../components/dashboard/DashInput";
import { useConference } from "../../hooks/useConference";
import {
  createRow,
  updateRow,
  deleteRow,
  reorderRows,
  lookupPersistedId,
} from "../../lib/contentApi";
import { isPersistedId } from "../../lib/ids";
import { topicToRow } from "../../lib/mappers";
import { withBase } from "../../config/paths";
import { isTopicEnabled, normalizeTopic, normalizeTopics } from "../../lib/topics";

const emptyTopic = () => ({
  name: "",
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
  const from = next.findIndex((t) => t.id === fromId);
  const to = next.findIndex((t) => t.id === toId);
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

function formatTopicError(message) {
  if (
    typeof message === "string" &&
    message.includes("enabled") &&
    message.includes("topics")
  ) {
    return "Database update required: run supabase/migrations/add_topics_enabled.sql in Supabase SQL Editor.";
  }
  return message;
}

async function resolveTopicId(topic) {
  if (!topic) return null;
  if (topic.id && isPersistedId(topic.id)) return topic.id;
  return lookupPersistedId("topics", topic);
}

export default function TopicsPage() {
  const { topics, refresh } = useConference();
  const [ordered, setOrdered] = useState(() => normalizeTopics(topics));
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [draggingId, setDraggingId] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);
  const [reordering, setReordering] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingTopicId, setEditingTopicId] = useState(null);
  const editingTopicIdRef = useRef(null);
  const editingOriginalRef = useRef(null);
  const [form, setForm] = useState(emptyTopic());
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
    setOrdered(normalizeTopics(topics));
  }, [topics]);

  const stats = useMemo(() => {
    const all = normalizeTopics(ordered);
    const visible = all.filter((t) => t.enabled).length;
    return { total: all.length, visible, hidden: all.length - visible };
  }, [ordered]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return ordered.filter((t) => {
      if (filter === "visible" && !t.enabled) return false;
      if (filter === "hidden" && t.enabled) return false;
      if (!q) return true;
      return t.name.toLowerCase().includes(q);
    });
  }, [ordered, search, filter]);

  const persistOrder = useCallback(
    async (list) => {
      setReordering(true);
      try {
        await reorderRows("topics", list.map((t) => t.id));
        await refresh();
        setMessage("Topic order updated.");
      } catch (err) {
        setMessage(err.message);
        setOrdered(normalizeTopics(topics));
      } finally {
        setReordering(false);
      }
    },
    [refresh, topics]
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

  const toggleEnabled = async (topic, next) => {
    if (togglingId === topic.id) return;

    const previous = isTopicEnabled(topic);
    const rowId = isPersistedId(topic.id) ? topic.id : null;

    setTogglingId(topic.id);
    setOrdered((prev) =>
      prev.map((t) => (t.id === topic.id ? { ...t, enabled: next } : t))
    );

    try {
      const id = rowId ?? (await resolveTopicId(topic));
      if (!id) {
        throw new Error("Could not find this topic in the database. Refresh and try again.");
      }

      const updated = await updateRow("topics", id, { enabled: next });
      const normalized = normalizeTopic(updated);

      setOrdered((prev) =>
        prev.map((t) => (t.id === topic.id || t.id === normalized.id ? normalized : t))
      );
      skipNextSyncRef.current = true;
      refresh();
      setMessage(next ? "Topic is now visible on the site." : "Topic hidden from the site.");
    } catch (err) {
      setOrdered((prev) =>
        prev.map((t) => (t.id === topic.id ? { ...t, enabled: previous } : t))
      );
      setMessage(formatTopicError(err.message));
    } finally {
      setTogglingId(null);
    }
  };

  const openCreate = () => {
    setIsEditing(false);
    setEditingTopicId(null);
    editingTopicIdRef.current = null;
    editingOriginalRef.current = null;
    setForm(emptyTopic());
    setError("");
    setModalOpen(true);
  };

  const openEdit = async (topic) => {
    setIsEditing(true);
    setForm({ ...topic });
    setError("");
    setModalOpen(true);
    editingOriginalRef.current = topic;

    if (isPersistedId(topic.id)) {
      editingTopicIdRef.current = topic.id;
      setEditingTopicId(topic.id);
      return;
    }

    setResolvingId(true);
    try {
      const id = await resolveTopicId(topic);
      editingTopicIdRef.current = id;
      setEditingTopicId(id);
      if (!id) {
        setError("Could not link this topic to the database. Refresh and try again.");
      }
    } finally {
      setResolvingId(false);
    }
  };

  const openDuplicate = (topic) => {
    setIsEditing(false);
    setEditingTopicId(null);
    editingTopicIdRef.current = null;
    editingOriginalRef.current = null;
    setForm({
      name: `${topic.name} (copy)`,
      enabled: false,
    });
    setError("");
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setIsEditing(false);
    setEditingTopicId(null);
    editingTopicIdRef.current = null;
    editingOriginalRef.current = null;
    setError("");
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name?.trim()) {
      setError("Please enter a topic name.");
      return;
    }

    setSaving(true);
    try {
      const row = topicToRow(form, ordered.length);
      const { sort_order: _sort, ...updates } = row;

      if (isEditing) {
        let id =
          editingTopicIdRef.current ??
          editingTopicId ??
          (form.id && isPersistedId(form.id) ? form.id : null);

        if (!id) {
          id = await lookupPersistedId("topics", editingOriginalRef.current ?? form);
        }

        if (!id) {
          throw new Error("Could not find this topic in the database. Refresh the page and try again.");
        }

        await updateRow("topics", id, updates);
      } else {
        await createRow("topics", row);
      }
      await refresh();
      closeModal();
      setMessage("Topic saved successfully.");
    } catch (err) {
      setError(formatTopicError(err.message));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (topic) => {
    if (!window.confirm(`Delete "${topic.name}"?`)) return;
    try {
      const id = await resolveTopicId(topic);
      if (!id) return;
      await deleteRow("topics", id);
      await refresh();
      setMessage("Topic deleted.");
    } catch (err) {
      setMessage(formatTopicError(err.message));
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-dash-muted mb-1">
            Homepage
          </p>
          <h1 className="text-2xl font-bold text-dash-text">Research Topics</h1>
          <p className="mt-1 text-sm text-dash-muted max-w-xl">
            Manage conference submission areas — drag to reorder, toggle visibility, or edit names.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <a
            href={`${withBase("/")}#topics`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-dash-border bg-white px-4 py-2.5 text-sm font-medium text-dash-text hover:bg-blue-50/80 hover:border-dash-primary/30 transition-colors duration-200 cursor-pointer dash-focus-ring"
          >
            View on site
            <HiOutlineArrowTopRightOnSquare className="w-4 h-4 text-dash-primary" aria-hidden="true" />
          </a>
          <DashButton onClick={openCreate}>
            <HiOutlinePlus className="w-4 h-4" />
            Add topic
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
            placeholder="Search topics…"
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
          Clear search and set filter to &quot;All&quot; to drag and reorder topics.
        </p>
      )}

      <div className="dash-card overflow-hidden">
        {filtered.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <HiOutlineTag className="mx-auto w-10 h-10 text-dash-muted/50 mb-3" />
            <p className="text-sm text-dash-muted">
              {ordered.length === 0
                ? "No topics yet. Add your first research area."
                : "No topics match your search or filter."}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-dash-border">
            {filtered.map((topic) => {
              const globalIndex = ordered.findIndex((t) => t.id === topic.id);
              const enabled = isTopicEnabled(topic);
              const isDragging = draggingId === topic.id;
              const isDropTarget = dragOverId === topic.id && draggingId !== topic.id;
              const orderLabel = String(globalIndex + 1).padStart(2, "0");

              return (
                <li
                  key={topic.id}
                  draggable={canReorder}
                  onDragStart={() => canReorder && handleDragStart(topic.id)}
                  onDragOver={(e) => canReorder && handleDragOver(e, topic.id)}
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
                    aria-label={`Drag to reorder ${topic.name}`}
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    <HiOutlineBars3 className="w-5 h-5" />
                  </button>

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-dash-primary font-bold text-sm tabular-nums">
                    {orderLabel}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-dash-text truncate">{topic.name}</p>
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
                    <p className="text-xs text-dash-muted mt-0.5">
                      Position {globalIndex + 1} of {ordered.length}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                    <DashToggle
                      id={`topic-toggle-${topic.id}`}
                      enabled={enabled}
                      disabled={togglingId === topic.id}
                      onChange={(next) => toggleEnabled(topic, next)}
                      ariaLabel={`${enabled ? "Hide" : "Show"} ${topic.name} on website`}
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
                      onClick={() => openEdit(topic)}
                      className="p-2 rounded-lg text-dash-muted hover:bg-blue-50 hover:text-dash-primary transition-colors duration-200 cursor-pointer dash-focus-ring"
                      aria-label="Edit"
                    >
                      <HiOutlinePencilSquare className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(topic)}
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
        Drag rows to reorder · Hidden topics stay in the dashboard but are removed from the public site
      </p>

      <DashModal
        title={isEditing ? "Edit topic" : "Add topic"}
        open={modalOpen}
        onClose={closeModal}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="flex items-center justify-between gap-4 rounded-xl border border-dash-border bg-dash-bg/40 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-dash-text">Show on website</p>
              <p className="text-xs text-dash-muted mt-0.5">
                {form.enabled !== false ? "Visible in topics section" : "Hidden from public site"}
              </p>
            </div>
            <DashToggle
              id="topic-form-enabled"
              enabled={form.enabled !== false}
              onChange={(v) => setForm({ ...form, enabled: v })}
            />
          </div>

          <DashInput
            label="Topic name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Artificial Intelligence"
            required
          />

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <DashButton variant="secondary" type="button" onClick={closeModal}>
              Cancel
            </DashButton>
            <DashButton
              type="submit"
              disabled={
                saving ||
                resolvingId ||
                (isEditing && !editingTopicId && !isPersistedId(form.id))
              }
            >
              {saving ? "Saving…" : resolvingId ? "Loading…" : "Save topic"}
            </DashButton>
          </div>
        </form>
      </DashModal>
    </div>
  );
}
