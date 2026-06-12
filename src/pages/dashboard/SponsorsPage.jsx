import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  HiOutlineBuildingOffice2,
  HiOutlinePlus,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineBars3,
  HiOutlineArrowTopRightOnSquare,
  HiOutlineMagnifyingGlass,
  HiOutlineChevronUp,
  HiOutlineChevronDown,
  HiOutlineEye,
  HiOutlineEyeSlash,
} from "react-icons/hi2";
import DashButton from "../../components/dashboard/DashButton";
import DashToggle from "../../components/dashboard/DashToggle";
import StatusBanner from "../../components/dashboard/StatusBanner";
import DashModal from "../../components/dashboard/DashModal";
import { DashInput } from "../../components/dashboard/DashInput";
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
import { sponsorToRow } from "../../lib/mappers";
import { withBase } from "../../config/paths";
import {
  isPartnerEnabled,
  normalizePartner,
  normalizePartners,
} from "../../lib/partners";
import { isSponsorsSectionEnabled } from "../../lib/sectionSettings";

const emptyPartner = () => ({
  name: "",
  logo: "",
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
  const from = next.findIndex((p) => p.id === fromId);
  const to = next.findIndex((p) => p.id === toId);
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

function formatPartnerError(message) {
  if (
    typeof message === "string" &&
    message.includes("enabled") &&
    message.includes("sponsors")
  ) {
    return "Database update required: run supabase/migrations/add_sponsors_enabled.sql in Supabase SQL Editor.";
  }
  return message;
}

async function resolvePartnerId(item) {
  if (!item) return null;
  if (item.id && isPersistedId(item.id)) return item.id;
  return lookupPersistedId("sponsors", item);
}

export default function SponsorsPage() {
  const { partners, sectionSettings, refresh } = useConference();
  const sectionEnabled = isSponsorsSectionEnabled(sectionSettings);
  const [ordered, setOrdered] = useState(() => normalizePartners(partners));
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [draggingId, setDraggingId] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);
  const [reordering, setReordering] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingPartnerId, setEditingPartnerId] = useState(null);
  const editingPartnerIdRef = useRef(null);
  const [form, setForm] = useState(emptyPartner());
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

  useEffect(() => {
    if (skipNextSyncRef.current) {
      skipNextSyncRef.current = false;
      return;
    }
    setOrdered(normalizePartners(partners));
  }, [partners]);

  const stats = useMemo(() => {
    const all = normalizePartners(ordered);
    const visible = all.filter((p) => p.enabled).length;
    return { total: all.length, visible, hidden: all.length - visible };
  }, [ordered]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return ordered.filter((p) => {
      if (filter === "visible" && !p.enabled) return false;
      if (filter === "hidden" && p.enabled) return false;
      if (!q) return true;
      return p.name.toLowerCase().includes(q);
    });
  }, [ordered, search, filter]);

  const persistOrder = useCallback(
    async (list) => {
      setReordering(true);
      try {
        await reorderRows("sponsors", list.map((p) => p.id));
        await refresh();
        setMessage("Partner order updated.");
      } catch (err) {
        setMessage(err.message);
        setOrdered(normalizePartners(partners));
      } finally {
        setReordering(false);
      }
    },
    [refresh, partners]
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

  const toggleSection = async (next) => {
    if (togglingSection) return;
    setTogglingSection(true);
    try {
      await upsertSetting("section_settings", {
        ...sectionSettings,
        sponsors: { enabled: next },
      });
      await refresh();
      setMessage(
        next
          ? "Partners section is now visible on the homepage."
          : "Partners section hidden from the homepage."
      );
    } catch (err) {
      setMessage(err.message);
    } finally {
      setTogglingSection(false);
    }
  };

  const toggleEnabled = async (item, next) => {
    if (togglingId === item.id) return;

    const previous = isPartnerEnabled(item);
    const rowId = isPersistedId(item.id) ? item.id : null;

    setTogglingId(item.id);
    setOrdered((prev) =>
      prev.map((p) => (p.id === item.id ? { ...p, enabled: next } : p))
    );

    try {
      const id = rowId ?? (await resolvePartnerId(item));
      if (!id) {
        throw new Error("Could not find this partner in the database. Refresh and try again.");
      }

      const updated = await updateRow("sponsors", id, { enabled: next });
      const normalized = normalizePartner(updated);

      setOrdered((prev) =>
        prev.map((p) => (p.id === item.id || p.id === normalized.id ? normalized : p))
      );
      skipNextSyncRef.current = true;
      refresh();
      setMessage(next ? "Partner is now visible on the site." : "Partner hidden from the site.");
    } catch (err) {
      setOrdered((prev) =>
        prev.map((p) => (p.id === item.id ? { ...p, enabled: previous } : p))
      );
      setMessage(formatPartnerError(err.message));
    } finally {
      setTogglingId(null);
    }
  };

  const openCreate = () => {
    setIsEditing(false);
    setEditingPartnerId(null);
    editingPartnerIdRef.current = null;
    setForm(emptyPartner());
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
      const id = await resolvePartnerId(item);
      editingPartnerIdRef.current = id;
      setEditingPartnerId(id);
      if (!id) {
        setError("Could not link this partner to the database. Refresh and try again.");
      }
    } finally {
      setResolvingId(false);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setIsEditing(false);
    setEditingPartnerId(null);
    editingPartnerIdRef.current = null;
    setError("");
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name?.trim()) {
      setError("Please enter a partner name.");
      return;
    }

    setSaving(true);
    try {
      const row = sponsorToRow(form, ordered.length);
      const { sort_order: _sort, ...updates } = row;

      if (isEditing) {
        let id =
          editingPartnerIdRef.current ??
          editingPartnerId ??
          (form.id && isPersistedId(form.id) ? form.id : null);

        if (!id) {
          id = await lookupPersistedId("sponsors", form);
        }

        if (!id) {
          throw new Error("Could not find this partner in the database. Refresh the page and try again.");
        }

        await updateRow("sponsors", id, updates);
      } else {
        await createRow("sponsors", row);
      }
      await refresh();
      closeModal();
      setMessage("Partner saved successfully.");
    } catch (err) {
      setError(formatPartnerError(err.message));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete "${item.name}"?`)) return;
    try {
      const id = await resolvePartnerId(item);
      if (!id) return;
      await deleteRow("sponsors", id);
      await refresh();
      setMessage("Partner deleted.");
    } catch (err) {
      setMessage(formatPartnerError(err.message));
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-dash-muted mb-1">
            Homepage
          </p>
          <h1 className="text-2xl font-bold text-dash-text">Sponsors & Partners</h1>
          <p className="mt-1 text-sm text-dash-muted max-w-xl">
            Manage partner logos — drag to reorder, toggle visibility, or upload brand assets.
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
                ? "Hide partners section on website"
                : "Show partners section on website"
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
            href={`${withBase("/")}#sponsors`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-dash-border bg-white px-4 py-2.5 text-sm font-medium text-dash-text hover:bg-blue-50/80 hover:border-dash-primary/30 transition-colors duration-200 cursor-pointer dash-focus-ring"
          >
            View on site
            <HiOutlineArrowTopRightOnSquare className="w-4 h-4 text-dash-primary" aria-hidden="true" />
          </a>
          <DashButton onClick={openCreate}>
            <HiOutlinePlus className="w-4 h-4" />
            Add partner
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
            <p className="text-sm font-semibold text-dash-text">Partners section on homepage</p>
            <p className="text-xs text-dash-muted mt-0.5">
              {sectionEnabled
                ? "The full partners grid is shown on the public site."
                : "The entire partners block is hidden — individual partner toggles have no effect until re-enabled."}
            </p>
          </div>
        </div>
        <DashToggle
          id="sponsors-section-enabled"
          enabled={sectionEnabled}
          disabled={togglingSection}
          onChange={toggleSection}
          ariaLabel={
            sectionEnabled
              ? "Hide partners section on website"
              : "Show partners section on website"
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
            placeholder="Search by partner name…"
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
          Clear search and set filter to &quot;All&quot; to drag and reorder partners.
        </p>
      )}

      <div
        className={`dash-card overflow-hidden transition-opacity duration-200 ${
          sectionEnabled ? "" : "opacity-60"
        }`}
      >
        {filtered.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <HiOutlineBuildingOffice2 className="mx-auto w-10 h-10 text-dash-muted/50 mb-3" />
            <p className="text-sm text-dash-muted">
              {ordered.length === 0
                ? "No partners yet. Add your first sponsor logo."
                : "No partners match your search or filter."}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-dash-border">
            {filtered.map((item) => {
              const globalIndex = ordered.findIndex((p) => p.id === item.id);
              const enabled = isPartnerEnabled(item);
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
                    aria-label={`Drag to reorder ${item.name}`}
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    <HiOutlineBars3 className="w-5 h-5" />
                  </button>

                  <div className="flex h-14 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-dash-border bg-white px-2">
                    {item.logo ? (
                      <CloudinaryImage
                        src={item.logo}
                        alt=""
                        width={160}
                        height={56}
                        crop="fit"
                        className="max-h-10 w-auto object-contain"
                      />
                    ) : (
                      <HiOutlineBuildingOffice2 className="w-6 h-6 text-dash-muted" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-dash-text truncate">{item.name}</p>
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
                      id={`partner-toggle-${item.id}`}
                      enabled={enabled}
                      disabled={togglingId === item.id}
                      onChange={(next) => toggleEnabled(item, next)}
                      ariaLabel={`${enabled ? "Hide" : "Show"} ${item.name} on website`}
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
        Drag rows to reorder · Use SVG or PNG logos with transparent backgrounds for best results
      </p>

      <DashModal
        title={isEditing ? "Edit partner" : "Add partner"}
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
                  ? "Visible in partners grid"
                  : "Hidden from public site"}
              </p>
            </div>
            <DashToggle
              id="partner-form-enabled"
              enabled={form.enabled !== false}
              onChange={(v) => setForm({ ...form, enabled: v })}
            />
          </div>

          <DashInput
            label="Partner name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Springer"
            required
          />

          <ImageUpload
            label="Logo"
            value={form.logo}
            onChange={(url) => setForm({ ...form, logo: url })}
            folder={CLOUDINARY_FOLDERS.sponsors}
            previewClassName="h-20 w-full max-w-xs object-contain rounded-xl bg-dash-bg p-3 mx-auto"
            hint="SVG or PNG recommended. Logos appear grayscale on the site until hover."
          />

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <DashButton variant="secondary" type="button" onClick={closeModal}>
              Cancel
            </DashButton>
            <DashButton type="submit" disabled={saving || resolvingId}>
              {saving ? "Saving…" : resolvingId ? "Loading…" : "Save partner"}
            </DashButton>
          </div>
        </form>
      </DashModal>
    </div>
  );
}
