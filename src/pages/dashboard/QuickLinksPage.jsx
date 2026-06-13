import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  HiOutlineLink,
  HiOutlinePlus,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineBars3,
  HiOutlineArrowTopRightOnSquare,
  HiOutlineMagnifyingGlass,
  HiOutlineChevronUp,
  HiOutlineChevronDown,
  HiOutlineDocumentText,
  HiOutlineCalendarDays,
  HiOutlinePaperAirplane,
  HiOutlineUserGroup,
} from "react-icons/hi2";
import DashButton from "../../components/dashboard/DashButton";
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
import { quickLinkToRow } from "../../lib/mappers";
import { withBase } from "../../config/paths";
import { normalizeQuickLink, normalizeQuickLinks } from "../../lib/quickLinks";

const ICON_OPTIONS = [
  { id: "document", label: "Document", Icon: HiOutlineDocumentText },
  { id: "calendar", label: "Calendar", Icon: HiOutlineCalendarDays },
  { id: "submit", label: "Submit", Icon: HiOutlinePaperAirplane },
  { id: "users", label: "Users", Icon: HiOutlineUserGroup },
];

const iconMap = Object.fromEntries(ICON_OPTIONS.map((o) => [o.id, o.Icon]));

const emptyLink = () => ({
  title: "",
  description: "",
  href: "",
  icon: "document",
});

function reorderList(list, fromId, toId) {
  if (fromId === toId) return list;
  const next = [...list];
  const from = next.findIndex((l) => l.id === fromId);
  const to = next.findIndex((l) => l.id === toId);
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

async function resolveQuickLinkId(item) {
  if (!item) return null;
  if (item.id && isPersistedId(item.id)) return item.id;
  return lookupPersistedId("quick_links", item);
}

export default function QuickLinksPage() {
  const { quickLinks, refresh } = useConference();
  const [ordered, setOrdered] = useState(() => normalizeQuickLinks(quickLinks));
  const [search, setSearch] = useState("");
  const [draggingId, setDraggingId] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);
  const [reordering, setReordering] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingLinkId, setEditingLinkId] = useState(null);
  const editingLinkIdRef = useRef(null);
  const editingOriginalRef = useRef(null);
  const [form, setForm] = useState(emptyLink());
  const [saving, setSaving] = useState(false);
  const [resolvingId, setResolvingId] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const skipNextSyncRef = useRef(false);
  const orderedRef = useRef(ordered);
  orderedRef.current = ordered;

  const canReorder = !search.trim();

  useEffect(() => {
    if (skipNextSyncRef.current) {
      skipNextSyncRef.current = false;
      return;
    }
    setOrdered(normalizeQuickLinks(quickLinks));
  }, [quickLinks]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return ordered;
    return ordered.filter(
      (link) =>
        link.title.toLowerCase().includes(q) ||
        link.description.toLowerCase().includes(q) ||
        link.href.toLowerCase().includes(q)
    );
  }, [ordered, search]);

  const persistOrder = useCallback(
    async (list) => {
      setReordering(true);
      try {
        await reorderRows(
          "quick_links",
          list.map((l) => l.id)
        );
        await refresh();
        setMessage("Link order updated.");
      } catch (err) {
        setMessage(err.message);
        setOrdered(normalizeQuickLinks(quickLinks));
      } finally {
        setReordering(false);
      }
    },
    [refresh, quickLinks]
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

  const openCreate = () => {
    setIsEditing(false);
    setEditingLinkId(null);
    editingLinkIdRef.current = null;
    editingOriginalRef.current = null;
    setForm(emptyLink());
    setError("");
    setModalOpen(true);
  };

  const openEdit = async (item) => {
    setIsEditing(true);
    setForm({ ...item });
    setError("");
    setModalOpen(true);
    editingOriginalRef.current = item;

    if (isPersistedId(item.id)) {
      editingLinkIdRef.current = item.id;
      setEditingLinkId(item.id);
      return;
    }

    setResolvingId(true);
    try {
      const id = await resolveQuickLinkId(item);
      editingLinkIdRef.current = id;
      setEditingLinkId(id);
      if (!id) {
        setError("Could not link this item to the database. Refresh and try again.");
      }
    } finally {
      setResolvingId(false);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setIsEditing(false);
    setEditingLinkId(null);
    editingLinkIdRef.current = null;
    editingOriginalRef.current = null;
    setError("");
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.title?.trim()) {
      setError("Please enter a link title.");
      return;
    }

    setSaving(true);
    try {
      const row = quickLinkToRow(form, ordered.length);
      const { sort_order: _sort, ...updates } = row;

      if (isEditing) {
        let id =
          editingLinkIdRef.current ??
          editingLinkId ??
          (form.id && isPersistedId(form.id) ? form.id : null);

        if (!id) {
          id = await lookupPersistedId(
            "quick_links",
            editingOriginalRef.current ?? form
          );
        }

        if (!id) {
          throw new Error(
            "Could not find this link in the database. Refresh the page and try again."
          );
        }

        await updateRow("quick_links", id, updates);
      } else {
        await createRow("quick_links", row);
      }

      await refresh();
      closeModal();
      setMessage("Quick link saved successfully.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete "${item.title}"?`)) return;
    try {
      const id = await resolveQuickLinkId(item);
      if (!id) return;
      await deleteRow("quick_links", id);
      await refresh();
      setMessage("Quick link deleted.");
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-dash-muted mb-1">
            Homepage
          </p>
          <h1 className="text-2xl font-bold text-dash-text">Quick Links</h1>
          <p className="mt-1 text-sm text-dash-muted max-w-xl">
            Manage navigation shortcuts shown below the hero — drag to reorder.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <a
            href={withBase("/")}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-dash-border bg-white px-4 py-2.5 text-sm font-medium text-dash-text hover:bg-blue-50/80 transition-colors duration-200 cursor-pointer dash-focus-ring"
          >
            View on site
            <HiOutlineArrowTopRightOnSquare className="w-4 h-4 text-dash-primary" aria-hidden="true" />
          </a>
          <DashButton onClick={openCreate}>
            <HiOutlinePlus className="w-4 h-4" aria-hidden="true" />
            Add link
          </DashButton>
        </div>
      </div>

      {message && (
        <div className="mb-6">
          <StatusBanner message={message} />
        </div>
      )}

      <div className="mb-6 dash-card px-4 py-3 inline-flex items-center gap-3">
        <p className="text-xl font-bold text-dash-text tabular-nums">{ordered.length}</p>
        <p className="text-sm text-dash-muted">links on homepage</p>
      </div>

      <div className="mb-4 relative max-w-md">
        <HiOutlineMagnifyingGlass
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dash-muted"
          aria-hidden="true"
        />
        <input
          type="search"
          placeholder="Search by title, URL, or description…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-dash-border bg-white pl-10 pr-4 py-2.5 text-sm text-dash-text placeholder:text-dash-muted focus:outline-none focus:ring-2 focus:ring-dash-primary/30 dash-focus-ring"
        />
      </div>

      {reordering && (
        <p className="mb-3 text-xs font-medium text-dash-primary">Saving order…</p>
      )}

      {!canReorder && ordered.length > 0 && (
        <p className="mb-3 text-xs text-dash-muted">Clear search to drag and reorder links.</p>
      )}

      <div className="dash-card overflow-hidden">
        {filtered.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <HiOutlineLink className="mx-auto w-10 h-10 text-dash-muted/50 mb-3" aria-hidden="true" />
            <p className="text-sm text-dash-muted">
              {ordered.length === 0
                ? "No quick links yet. Add your first link."
                : "No links match your search."}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-dash-border">
            {filtered.map((link) => {
              const globalIndex = ordered.findIndex((l) => l.id === link.id);
              const isDragging = draggingId === link.id;
              const isDropTarget = dragOverId === link.id && draggingId !== link.id;
              const LinkIcon = iconMap[link.icon] ?? HiOutlineDocumentText;

              return (
                <li
                  key={link.id}
                  draggable={canReorder}
                  onDragStart={() => canReorder && handleDragStart(link.id)}
                  onDragOver={(e) => canReorder && handleDragOver(e, link.id)}
                  onDragEnd={() => canReorder && handleDragEnd()}
                  className={`flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-4 transition-colors duration-200 ${
                    isDragging ? "opacity-40 bg-blue-50/50" : ""
                  } ${
                    isDropTarget
                      ? "bg-blue-50/80 ring-2 ring-inset ring-dash-primary/30"
                      : "hover:bg-blue-50/30"
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
                    aria-label={`Drag to reorder ${link.title}`}
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    <HiOutlineBars3 className="w-5 h-5" aria-hidden="true" />
                  </button>

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-dash-primary">
                    <LinkIcon className="w-5 h-5" aria-hidden="true" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-dash-text truncate">{link.title}</p>
                    <p className="text-sm text-dash-primary truncate">{link.href || "No URL"}</p>
                    {link.description && (
                      <p className="text-xs text-dash-muted truncate mt-0.5">{link.description}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      disabled={globalIndex === 0 || reordering}
                      onClick={() => handleMove(globalIndex, -1)}
                      className="hidden sm:block p-2 rounded-lg text-dash-muted hover:text-dash-primary hover:bg-blue-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-200 cursor-pointer dash-focus-ring"
                      aria-label="Move up"
                    >
                      <HiOutlineChevronUp className="w-4 h-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      disabled={globalIndex >= ordered.length - 1 || reordering}
                      onClick={() => handleMove(globalIndex, 1)}
                      className="hidden sm:block p-2 rounded-lg text-dash-muted hover:text-dash-primary hover:bg-blue-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-200 cursor-pointer dash-focus-ring"
                      aria-label="Move down"
                    >
                      <HiOutlineChevronDown className="w-4 h-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => openEdit(link)}
                      className="p-2 rounded-lg text-dash-muted hover:text-dash-primary hover:bg-blue-50 transition-colors duration-200 cursor-pointer dash-focus-ring"
                      aria-label={`Edit ${link.title}`}
                    >
                      <HiOutlinePencilSquare className="w-4 h-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(link)}
                      className="p-2 rounded-lg text-dash-muted hover:text-red-600 hover:bg-red-50 transition-colors duration-200 cursor-pointer dash-focus-ring"
                      aria-label={`Delete ${link.title}`}
                    >
                      <HiOutlineTrash className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <DashModal
        title={isEditing ? "Edit quick link" : "Add quick link"}
        open={modalOpen}
        onClose={closeModal}
        wide
      >
        <form onSubmit={handleSave} className="space-y-4">
          <DashInput
            label="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Call for Papers"
            required
          />
          <DashTextarea
            label="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={2}
            placeholder="Short helper text shown under the title"
          />
          <DashInput
            label="URL"
            value={form.href}
            onChange={(e) => setForm({ ...form, href: e.target.value })}
            placeholder="#call-for-papers or https://…"
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

          {error && (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <DashButton variant="secondary" type="button" onClick={closeModal}>
              Cancel
            </DashButton>
            <DashButton
              type="submit"
              disabled={
                saving ||
                resolvingId ||
                (isEditing && !editingLinkId && !isPersistedId(form.id))
              }
            >
              {saving ? "Saving…" : resolvingId ? "Loading…" : "Save link"}
            </DashButton>
          </div>
        </form>
      </DashModal>
    </div>
  );
}
