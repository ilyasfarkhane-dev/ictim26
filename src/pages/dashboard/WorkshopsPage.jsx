import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  HiOutlineAcademicCap,
  HiOutlinePlus,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineBars3,
  HiOutlineArrowTopRightOnSquare,
  HiOutlineMagnifyingGlass,
  HiOutlineChevronUp,
  HiOutlineChevronDown,
  HiOutlineClock,
  HiOutlineBanknotes,
  HiOutlineEye,
  HiOutlineEyeSlash,
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
  lookupPersistedId,
  upsertSetting,
} from "../../lib/contentApi";
import { CLOUDINARY_FOLDERS } from "../../lib/cloudinary";
import { isPersistedId } from "../../lib/ids";
import { workshopToRow } from "../../lib/mappers";
import { withBase } from "../../config/paths";
import {
  isWorkshopEnabled,
  normalizeWorkshop,
  normalizeWorkshops,
} from "../../lib/workshops";
import { isWorkshopsSectionEnabled } from "../../lib/sectionSettings";

const emptyWorkshop = (nextNumber = 1) => ({
  number: nextNumber,
  title: "",
  subtitle: "",
  description: "",
  facilitator: { name: "", credentials: "" },
  objectives: [],
  duration: "2:00",
  price: 300,
  currency: "DH",
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
  const from = next.findIndex((w) => w.id === fromId);
  const to = next.findIndex((w) => w.id === toId);
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

function formatWorkshopError(message) {
  if (
    typeof message === "string" &&
    message.includes("enabled") &&
    message.includes("workshops")
  ) {
    return "Database update required: run supabase/migrations/add_workshops_enabled.sql in Supabase SQL Editor.";
  }
  return message;
}

async function resolveWorkshopId(item) {
  if (!item) return null;
  if (item.id && isPersistedId(item.id)) return item.id;
  return lookupPersistedId("workshops", item);
}

export default function WorkshopsPage() {
  const { workshops, sectionSettings, refresh } = useConference();
  const sectionEnabled = isWorkshopsSectionEnabled(sectionSettings);
  const [ordered, setOrdered] = useState(() => normalizeWorkshops(workshops));
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [draggingId, setDraggingId] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);
  const [reordering, setReordering] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingWorkshopId, setEditingWorkshopId] = useState(null);
  const editingWorkshopIdRef = useRef(null);
  const [form, setForm] = useState(emptyWorkshop());
  const [saving, setSaving] = useState(false);
  const [resolvingId, setResolvingId] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [togglingId, setTogglingId] = useState(null);
  const [togglingSection, setTogglingSection] = useState(false);
  const skipNextSyncRef = useRef(false);
  const orderedRef = useRef(ordered);
  orderedRef.current = ordered;

  const canReorder = !search.trim() && filter === "all";
  const nextWorkshopNumber = useMemo(() => {
    const nums = ordered.map((w) => Number(w.number) || 0);
    return (nums.length ? Math.max(...nums) : 0) + 1;
  }, [ordered]);

  useEffect(() => {
    if (skipNextSyncRef.current) {
      skipNextSyncRef.current = false;
      return;
    }
    setOrdered(normalizeWorkshops(workshops));
  }, [workshops]);

  const stats = useMemo(() => {
    const all = normalizeWorkshops(ordered);
    const visible = all.filter((w) => w.enabled).length;
    return { total: all.length, visible, hidden: all.length - visible };
  }, [ordered]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return ordered.filter((w) => {
      if (filter === "visible" && !w.enabled) return false;
      if (filter === "hidden" && w.enabled) return false;
      if (!q) return true;
      return (
        w.title.toLowerCase().includes(q) ||
        w.subtitle.toLowerCase().includes(q) ||
        w.facilitator.name.toLowerCase().includes(q) ||
        String(w.number).includes(q)
      );
    });
  }, [ordered, search, filter]);

  const persistOrder = useCallback(
    async (list) => {
      setReordering(true);
      try {
        await reorderRows("workshops", list.map((w) => w.id));
        await refresh();
        setMessage("Workshop order updated.");
      } catch (err) {
        setMessage(err.message);
        setOrdered(normalizeWorkshops(workshops));
      } finally {
        setReordering(false);
      }
    },
    [refresh, workshops]
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

    const previous = isWorkshopEnabled(item);
    const rowId = isPersistedId(item.id) ? item.id : null;

    setTogglingId(item.id);
    setOrdered((prev) =>
      prev.map((w) => (w.id === item.id ? { ...w, enabled: next } : w))
    );

    try {
      const id = rowId ?? (await resolveWorkshopId(item));
      if (!id) {
        throw new Error("Could not find this workshop in the database. Refresh and try again.");
      }

      const updated = await updateRow("workshops", id, { enabled: next });
      const normalized = normalizeWorkshop(updated);

      setOrdered((prev) =>
        prev.map((w) => (w.id === item.id || w.id === normalized.id ? normalized : w))
      );
      skipNextSyncRef.current = true;
      refresh();
      setMessage(next ? "Workshop is now visible on the site." : "Workshop hidden from the site.");
    } catch (err) {
      setOrdered((prev) =>
        prev.map((w) => (w.id === item.id ? { ...w, enabled: previous } : w))
      );
      setMessage(formatWorkshopError(err.message));
    } finally {
      setTogglingId(null);
    }
  };

  const toggleSection = async (next) => {
    if (togglingSection) return;
    setTogglingSection(true);
    try {
      await upsertSetting("section_settings", {
        ...sectionSettings,
        workshops: { enabled: next },
      });
      await refresh();
      setMessage(
        next
          ? "Workshop section is now visible on the registration page."
          : "Workshop section hidden from the registration page."
      );
    } catch (err) {
      setMessage(err.message);
    } finally {
      setTogglingSection(false);
    }
  };

  const openCreate = () => {
    setIsEditing(false);
    setEditingWorkshopId(null);
    editingWorkshopIdRef.current = null;
    setForm(emptyWorkshop(nextWorkshopNumber));
    setError("");
    setModalOpen(true);
  };

  const openEdit = async (item) => {
    setIsEditing(true);
    setForm({ ...item, objectives: [...(item.objectives ?? [])] });
    setError("");
    setModalOpen(true);
    setResolvingId(true);

    try {
      const id = await resolveWorkshopId(item);
      editingWorkshopIdRef.current = id;
      setEditingWorkshopId(id);
      if (!id) {
        setError("Could not link this workshop to the database. Refresh and try again.");
      }
    } finally {
      setResolvingId(false);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setIsEditing(false);
    setEditingWorkshopId(null);
    editingWorkshopIdRef.current = null;
    setError("");
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.title?.trim()) {
      setError("Please enter a workshop title.");
      return;
    }

    setSaving(true);
    try {
      const row = workshopToRow(form, ordered.length);
      const { sort_order: _sort, ...updates } = row;

      if (isEditing) {
        let id =
          editingWorkshopIdRef.current ??
          editingWorkshopId ??
          (form.id && isPersistedId(form.id) ? form.id : null);

        if (!id) {
          id = await lookupPersistedId("workshops", form);
        }

        if (!id) {
          throw new Error("Could not find this workshop in the database. Refresh the page and try again.");
        }

        await updateRow("workshops", id, updates);
      } else {
        await createRow("workshops", row);
      }
      await refresh();
      closeModal();
      setMessage("Workshop saved successfully.");
    } catch (err) {
      setError(formatWorkshopError(err.message));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete "${item.title}"?`)) return;
    try {
      const id = await resolveWorkshopId(item);
      if (!id) return;
      await deleteRow("workshops", id);
      await refresh();
      setMessage("Workshop deleted.");
    } catch (err) {
      setMessage(formatWorkshopError(err.message));
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-dash-muted mb-1">
            Registration
          </p>
          <h1 className="text-2xl font-bold text-dash-text">Workshops</h1>
          <p className="mt-1 text-sm text-dash-muted max-w-xl">
            Manage practical workshop sessions — reorder cards, toggle visibility, and edit pricing details.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={togglingSection}
            onClick={() => toggleSection(!sectionEnabled)}
            className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors duration-200 cursor-pointer dash-focus-ring disabled:opacity-50 disabled:cursor-not-allowed ${
              sectionEnabled
                ? "border-dash-border bg-white text-dash-text hover:bg-blue-50/80 hover:border-dash-primary/30"
                : "border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100"
            }`}
            aria-label={
              sectionEnabled
                ? "Hide workshop section on website"
                : "Show workshop section on website"
            }
            title={sectionEnabled ? "Hide section on site" : "Show section on site"}
          >
            {sectionEnabled ? (
              <HiOutlineEye className="w-4 h-4 text-dash-primary" aria-hidden="true" />
            ) : (
              <HiOutlineEyeSlash className="w-4 h-4 text-amber-700" aria-hidden="true" />
            )}
            {sectionEnabled ? "Section visible" : "Section hidden"}
          </button>
          <a
            href={`${withBase("/")}#register-pricing`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-dash-border bg-white px-4 py-2.5 text-sm font-medium text-dash-text hover:bg-blue-50/80 hover:border-dash-primary/30 transition-colors duration-200 cursor-pointer dash-focus-ring"
          >
            View on site
            <HiOutlineArrowTopRightOnSquare className="w-4 h-4 text-dash-primary" aria-hidden="true" />
          </a>
          <DashButton onClick={openCreate}>
            <HiOutlinePlus className="w-4 h-4" />
            Add workshop
          </DashButton>
        </div>
      </div>

      {message && (
        <div className="mb-6">
          <StatusBanner message={message} />
        </div>
      )}

      <div
        className={`mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-xl border px-4 py-3 transition-colors duration-200 ${
          sectionEnabled
            ? "border-dash-border bg-white"
            : "border-amber-200 bg-amber-50/80"
        }`}
      >
        <div className="flex items-start sm:items-center gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
              sectionEnabled ? "bg-blue-50 text-dash-primary" : "bg-amber-100 text-amber-700"
            }`}
          >
            {sectionEnabled ? (
              <HiOutlineEye className="w-5 h-5" aria-hidden="true" />
            ) : (
              <HiOutlineEyeSlash className="w-5 h-5" aria-hidden="true" />
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-dash-text">Workshop section on homepage</p>
            <p className="text-xs text-dash-muted mt-0.5">
              {sectionEnabled
                ? "The full workshop block is shown on the registration page."
                : "The entire workshop block is hidden — individual workshop toggles have no effect until re-enabled."}
            </p>
          </div>
        </div>
        <DashToggle
          id="workshops-section-enabled"
          enabled={sectionEnabled}
          disabled={togglingSection}
          onChange={toggleSection}
          ariaLabel={
            sectionEnabled
              ? "Hide workshop section on website"
              : "Show workshop section on website"
          }
        />
      </div>

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
            placeholder="Search by title, facilitator, or number…"
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
          Clear search and set filter to &quot;All&quot; to drag and reorder workshops.
        </p>
      )}

      <div
        className={`dash-card overflow-hidden transition-opacity duration-200 ${
          sectionEnabled ? "" : "opacity-60"
        }`}
      >
        {filtered.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <HiOutlineAcademicCap className="mx-auto w-10 h-10 text-dash-muted/50 mb-3" />
            <p className="text-sm text-dash-muted">
              {ordered.length === 0
                ? "No workshops yet. Add your first practical session."
                : "No workshops match your search or filter."}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-dash-border">
            {filtered.map((item) => {
              const globalIndex = ordered.findIndex((w) => w.id === item.id);
              const enabled = isWorkshopEnabled(item);
              const isDragging = draggingId === item.id;
              const isDropTarget = dragOverId === item.id && draggingId !== item.id;

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

                  <div className="h-14 w-20 shrink-0 overflow-hidden rounded-xl border border-dash-border bg-dash-bg">
                    {item.image ? (
                      <CloudinaryImage
                        src={item.image}
                        alt=""
                        width={160}
                        height={112}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-dash-muted">
                        <HiOutlineAcademicCap className="w-6 h-6" />
                      </div>
                    )}
                  </div>

                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-dash-primary text-sm font-bold tabular-nums">
                    {item.number || "—"}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                          enabled
                            ? "bg-blue-50 text-dash-primary"
                            : "bg-slate-100 text-dash-muted"
                        }`}
                      >
                        {enabled ? "Visible" : "Hidden"}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-dash-muted">
                        <HiOutlineClock className="w-3 h-3" aria-hidden="true" />
                        {item.duration || "—"}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-dash-primary">
                        <HiOutlineBanknotes className="w-3 h-3" aria-hidden="true" />
                        {item.price} {item.currency}
                      </span>
                    </div>
                    <p className="font-semibold text-dash-text truncate">{item.title}</p>
                    {item.subtitle && (
                      <p className="text-xs text-dash-muted truncate">{item.subtitle}</p>
                    )}
                    {item.facilitator?.name && (
                      <p className="text-sm text-dash-primary truncate mt-0.5">
                        {item.facilitator.name}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                    <DashToggle
                      id={`workshop-toggle-${item.id}`}
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
        Drag rows to reorder · Hidden workshops stay in the list but are removed from the registration page
      </p>

      <DashModal
        title={isEditing ? "Edit workshop" : "Add workshop"}
        open={modalOpen}
        onClose={closeModal}
        wide
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="flex items-center justify-between gap-4 rounded-xl border border-dash-border bg-dash-bg/40 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-dash-text">Show on website</p>
              <p className="text-xs text-dash-muted mt-0.5">
                {form.enabled !== false
                  ? "Visible on registration page"
                  : "Hidden from public site"}
              </p>
            </div>
            <DashToggle
              id="workshop-form-enabled"
              enabled={form.enabled !== false}
              onChange={(v) => setForm({ ...form, enabled: v })}
            />
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <DashInput
              label="Workshop number"
              type="number"
              min={1}
              value={form.number}
              onChange={(e) => setForm({ ...form, number: Number(e.target.value) })}
            />
            <DashInput
              label="Duration"
              value={form.duration}
              onChange={(e) => setForm({ ...form, duration: e.target.value })}
              placeholder="2:00"
            />
            <div className="grid grid-cols-[1fr_auto] gap-2">
              <DashInput
                label="Price"
                type="number"
                min={0}
                value={form.price}
                onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
              />
              <DashInput
                label="Currency"
                value={form.currency}
                onChange={(e) => setForm({ ...form, currency: e.target.value })}
                className="min-w-[4.5rem]"
              />
            </div>
          </div>

          <DashInput
            label="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Generative AI for Scientific Research"
            required
          />
          <DashInput
            label="Subtitle"
            value={form.subtitle}
            onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
            placeholder="Practical Workshop 1 — ICTIM'26"
          />
          <DashTextarea
            label="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
            placeholder="Brief overview of what participants will learn…"
          />

          <div className="grid sm:grid-cols-2 gap-4">
            <DashInput
              label="Facilitator name"
              value={form.facilitator?.name ?? ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  facilitator: { ...form.facilitator, name: e.target.value },
                })
              }
            />
            <DashInput
              label="Facilitator credentials"
              value={form.facilitator?.credentials ?? ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  facilitator: { ...form.facilitator, credentials: e.target.value },
                })
              }
            />
          </div>

          <DashTextarea
            label="Learning objectives (one per line)"
            value={(form.objectives ?? []).join("\n")}
            onChange={(e) =>
              setForm({
                ...form,
                objectives: e.target.value.split("\n").filter(Boolean),
              })
            }
            rows={4}
            placeholder="Understand LLM capabilities for research assistance"
          />

          <ImageUpload
            label="Workshop banner"
            value={form.image}
            onChange={(url) => setForm({ ...form, image: url })}
            folder={CLOUDINARY_FOLDERS.workshops}
            previewClassName="h-36 w-full object-cover rounded-xl"
            hint="Shown at the top of the registration card on the homepage."
          />

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <DashButton variant="secondary" type="button" onClick={closeModal}>
              Cancel
            </DashButton>
            <DashButton type="submit" disabled={saving || resolvingId}>
              {saving ? "Saving…" : resolvingId ? "Loading…" : "Save workshop"}
            </DashButton>
          </div>
        </form>
      </DashModal>
    </div>
  );
}
