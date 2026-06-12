import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  HiOutlineUserGroup,
  HiOutlinePlus,
  HiOutlineTrash,
  HiOutlineChevronUp,
  HiOutlineChevronDown,
  HiOutlineEye,
  HiOutlineEyeSlash,
  HiOutlineArrowTopRightOnSquare,
  HiOutlineGlobeAlt,
  HiOutlineMagnifyingGlass,
  HiOutlinePencilSquare,
  HiOutlineBars3,
} from "react-icons/hi2";
import DashButton from "../../components/dashboard/DashButton";
import DashToggle from "../../components/dashboard/DashToggle";
import DashModal from "../../components/dashboard/DashModal";
import StatusBanner from "../../components/dashboard/StatusBanner";
import { DashInput, DashTextarea } from "../../components/dashboard/DashInput";
import { useConference } from "../../hooks/useConference";
import { upsertSetting } from "../../lib/contentApi";
import { withBase } from "../../config/paths";
import { isCommitteesSectionEnabled } from "../../lib/sectionSettings";
import {
  emptyMember,
  getVisibleMembers,
  hydrateCommitteesForEdit,
  memberInitial,
  normalizeCommittees,
  prepareCommitteesForSave,
} from "../../lib/committees";
import {
  downloadCommitteeTemplate,
  parseCommitteeExcelFile,
} from "../../lib/parseCommitteeExcel";
import ExcelImport from "../../components/dashboard/ExcelImport";

const TABS = [
  {
    id: "organizingSenior",
    label: "Organizing (Senior)",
    shortLabel: "Senior",
    description: "Organizing Local Committee (Senior)",
    prefix: "org-sr",
    showEmail: true,
  },
  {
    id: "organizingJuniors",
    label: "Organizing (Juniors)",
    shortLabel: "Juniors",
    description: "Organizing Local Committee (Juniors)",
    prefix: "org-jr",
    showEmail: false,
  },
  {
    id: "scientific",
    label: "Scientific Committee",
    shortLabel: "Scientific",
    description: "Scientific Committee members",
    prefix: "sci",
    showEmail: false,
  },
];

const FILTERS = [
  { id: "all", label: "All" },
  { id: "visible", label: "Visible" },
  { id: "hidden", label: "Hidden" },
];

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

function reorderList(list, fromId, toId) {
  if (fromId === toId) return list;
  const next = [...list];
  const from = next.findIndex((m) => m.id === fromId);
  const to = next.findIndex((m) => m.id === toId);
  if (from < 0 || to < 0) return list;
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

function emptyMemberForm(prefix, showEmail) {
  return {
    ...emptyMember(prefix),
    name: "",
    affiliation: "",
    email: showEmail ? "" : "",
    enabled: true,
  };
}

export default function CommitteesPage() {
  const { committees: liveCommittees, sectionSettings, refresh } = useConference();
  const sectionEnabled = isCommitteesSectionEnabled(sectionSettings);
  const [activeTab, setActiveTab] = useState("organizingSenior");
  const [form, setForm] = useState(() => hydrateCommitteesForEdit(liveCommittees));
  const [savedForm, setSavedForm] = useState(() => hydrateCommitteesForEdit(liveCommittees));
  const [saving, setSaving] = useState(false);
  const [togglingSection, setTogglingSection] = useState(false);
  const [message, setMessage] = useState("");

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [draggingId, setDraggingId] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState(null);
  const [memberForm, setMemberForm] = useState(emptyMemberForm("org-sr", true));
  const [modalError, setModalError] = useState("");

  useEffect(() => {
    const next = hydrateCommitteesForEdit(liveCommittees);
    setForm(next);
    setSavedForm(cloneForm(next));
  }, [liveCommittees]);

  const isDirty = useMemo(
    () =>
      JSON.stringify(prepareCommitteesForSave(form)) !==
      JSON.stringify(prepareCommitteesForSave(savedForm)),
    [form, savedForm]
  );

  const activeMeta = TABS.find((t) => t.id === activeTab) ?? TABS[0];
  const activeMembers = form[activeTab] ?? [];

  const stats = useMemo(() => {
    const normalized = normalizeCommittees(form);
    return TABS.reduce((acc, tab) => {
      const all = normalized[tab.id] ?? [];
      const visible = getVisibleMembers(all);
      acc[tab.id] = {
        total: all.length,
        visible: visible.length,
        hidden: all.length - visible.length,
      };
      return acc;
    }, {});
  }, [form]);

  const canReorder = !search.trim() && filter === "all";

  const filteredMembers = useMemo(() => {
    const q = search.trim().toLowerCase();
    return activeMembers.filter((member) => {
      if (filter === "visible" && member.enabled === false) return false;
      if (filter === "hidden" && member.enabled !== false) return false;
      if (!q) return true;
      return (
        member.name?.toLowerCase().includes(q) ||
        member.affiliation?.toLowerCase().includes(q) ||
        member.email?.toLowerCase().includes(q)
      );
    });
  }, [activeMembers, search, filter]);

  const visiblePreview = useMemo(
    () => getVisibleMembers(activeMembers).slice(0, 5),
    [activeMembers]
  );

  const toggleSectionVisibility = async (next) => {
    if (togglingSection) return;
    setTogglingSection(true);
    try {
      await upsertSetting("section_settings", {
        ...sectionSettings,
        committees: { enabled: next },
      });
      await refresh();
      setMessage(next ? "Committees section is now visible on the site." : "Committees section hidden.");
    } catch (err) {
      setMessage(err.message);
    } finally {
      setTogglingSection(false);
    }
  };

  const handleDiscard = () => {
    setForm(cloneForm(savedForm));
    setMessage("");
  };

  const handleSave = async (e) => {
    e?.preventDefault?.();
    setSaving(true);
    setMessage("");
    try {
      const payload = prepareCommitteesForSave(form);
      await upsertSetting("committees", payload);
      const hydrated = hydrateCommitteesForEdit(payload);
      await refresh();
      setForm(hydrated);
      setSavedForm(cloneForm(hydrated));
      setMessage("Committees saved successfully.");
    } catch (err) {
      setMessage(err.message);
    } finally {
      setSaving(false);
    }
  };

  const updateList = useCallback((key, list) => {
    setForm((prev) => ({ ...prev, [key]: list }));
  }, []);

  const openCreate = () => {
    setIsEditing(false);
    setEditingMemberId(null);
    setMemberForm(emptyMemberForm(activeMeta.prefix, activeMeta.showEmail));
    setModalError("");
    setModalOpen(true);
  };

  const openEdit = (member) => {
    setIsEditing(true);
    setEditingMemberId(member.id);
    setMemberForm({ ...member });
    setModalError("");
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setIsEditing(false);
    setEditingMemberId(null);
    setModalError("");
  };

  const handleMemberSave = (e) => {
    e.preventDefault();
    if (!memberForm.name?.trim()) {
      setModalError("Name is required.");
      return;
    }

    if (isEditing) {
      updateList(
        activeTab,
        activeMembers.map((m) => (m.id === editingMemberId ? { ...memberForm } : m))
      );
    } else {
      updateList(activeTab, [...activeMembers, { ...memberForm }]);
    }
    closeModal();
  };

  const handleRemove = (member) => {
    if (!window.confirm(`Remove "${member.name || "this member"}" from ${activeMeta.label}?`)) return;
    updateList(
      activeTab,
      activeMembers.filter((m) => m.id !== member.id)
    );
  };

  const handleDragStart = (id) => setDraggingId(id);

  const handleDragOver = (e, targetId) => {
    e.preventDefault();
    if (!draggingId || draggingId === targetId) return;
    setDragOverId(targetId);
  };

  const handleDragEnd = () => {
    if (draggingId && dragOverId && draggingId !== dragOverId) {
      updateList(activeTab, reorderList(activeMembers, draggingId, dragOverId));
    }
    setDraggingId(null);
    setDragOverId(null);
  };

  const mergeImportedMembers = (current, imported, mode) => {
    const validImported = (imported ?? []).filter((member) => member?.name?.trim());
    if (mode === "append") {
      const existing = (current ?? []).filter((member) => member?.name?.trim());
      return validImported.length ? [...existing, ...validImported] : current ?? [];
    }
    if (validImported.length === 0) return current ?? [];
    return validImported;
  };

  const handleExcelImport = async (file, { mode }) => {
    const parsed = await parseCommitteeExcelFile(file, {
      activeTab,
      activePrefix: activeMeta.prefix,
    });

    if (parsed.mode === "multi") {
      setForm((prev) => ({
        ...prev,
        organizingSenior: mergeImportedMembers(prev.organizingSenior, parsed.organizingSenior, mode),
        organizingJuniors: mergeImportedMembers(prev.organizingJuniors, parsed.organizingJuniors, mode),
        scientific: mergeImportedMembers(prev.scientific, parsed.scientific, mode),
      }));
      setMessage(
        `Imported ${parsed.totalRows} member${parsed.totalRows === 1 ? "" : "s"} across committees. Save to publish.`
      );
      return;
    }

    const imported = parsed[activeTab] ?? [];
    setForm((prev) => ({
      ...prev,
      [activeTab]: mergeImportedMembers(prev[activeTab], imported, mode),
    }));
    setMessage(
      `Imported ${imported.length} member${imported.length === 1 ? "" : "s"} into ${activeMeta.label}. Save to publish.`
    );
  };

  const switchTab = (tabId) => {
    setActiveTab(tabId);
    setSearch("");
    setFilter("all");
  };

  return (
    <div className={isDirty ? "pb-24" : ""}>
      <div className="mb-6 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-dash-muted mb-1">
            Homepage
          </p>
          <h1 className="text-2xl font-bold text-dash-text">Committees</h1>
          <p className="mt-1 text-sm text-dash-muted max-w-xl">
            Manage organizing local committees (senior & juniors) and the scientific committee
            shown on the homepage.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={togglingSection}
            onClick={() => toggleSectionVisibility(!sectionEnabled)}
            className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors duration-200 cursor-pointer dash-focus-ring disabled:opacity-50 ${
              sectionEnabled
                ? "border-dash-border bg-white text-dash-text hover:bg-blue-50/80"
                : "border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100"
            }`}
          >
            {sectionEnabled ? (
              <HiOutlineEye className="w-4 h-4 text-dash-primary" aria-hidden="true" />
            ) : (
              <HiOutlineEyeSlash className="w-4 h-4 text-amber-700" aria-hidden="true" />
            )}
            {sectionEnabled ? "Section visible" : "Section hidden"}
          </button>
          <a
            href={`${withBase("/")}#committees`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-dash-border bg-white px-4 py-2.5 text-sm font-medium text-dash-text hover:bg-blue-50/80 transition-colors duration-200 cursor-pointer dash-focus-ring"
          >
            View on site
            <HiOutlineArrowTopRightOnSquare className="w-4 h-4 text-dash-primary" aria-hidden="true" />
          </a>
          <DashButton onClick={openCreate}>
            <HiOutlinePlus className="w-4 h-4" aria-hidden="true" />
            Add member
          </DashButton>
        </div>
      </div>

      {message && (
        <div className="mb-6">
          <StatusBanner message={message} />
        </div>
      )}

      <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
        {TABS.map((tab) => {
          const tabStats = stats[tab.id];
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => switchTab(tab.id)}
              className={`dash-card px-4 py-3 text-left transition-all duration-200 cursor-pointer dash-focus-ring ${
                isActive
                  ? "ring-2 ring-dash-primary/40 border-dash-primary/30 bg-blue-50/40"
                  : "hover:border-dash-primary/20 hover:bg-blue-50/20"
              }`}
            >
              <p className="text-xl font-bold text-dash-text tabular-nums">{tabStats.visible}</p>
              <p className="text-xs text-dash-muted mt-0.5">
                {tab.shortLabel}
                {tabStats.hidden > 0 && (
                  <span className="text-dash-muted/70"> · {tabStats.hidden} hidden</span>
                )}
              </p>
            </button>
          );
        })}
      </div>

      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {TABS.map((tab) => {
          const count = stats[tab.id].visible;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => switchTab(tab.id)}
              className={`shrink-0 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors duration-200 cursor-pointer dash-focus-ring ${
                activeTab === tab.id
                  ? "bg-dash-primary text-white shadow-sm"
                  : "bg-white border border-dash-border text-dash-text hover:bg-blue-50/80"
              }`}
            >
              {tab.label}
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums ${
                  activeTab === tab.id ? "bg-white/20 text-white" : "bg-blue-50 text-dash-primary"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mb-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <HiOutlineMagnifyingGlass
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dash-muted"
            aria-hidden="true"
          />
          <input
            type="search"
            placeholder="Search by name, affiliation, or email…"
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

      {!canReorder && activeMembers.length > 0 && (
        <p className="mb-3 text-xs text-dash-muted">
          Clear search and set filter to &quot;All&quot; to drag and reorder members.
        </p>
      )}

      <div className="space-y-4 mb-6">
        <ExcelImport
          title="Import from Excel"
          description="Bulk-add members from a spreadsheet. Choose replace or append, then save to publish."
          formatGuide={
            <>
              <p>
                <strong>Required columns:</strong> Name, Affiliation
              </p>
              <p>
                <strong>Optional:</strong> Email (senior committee only)
              </p>
              <p>
                <strong>All committees at once:</strong> add a Committee column with values{" "}
                <em>Senior</em>, <em>Juniors</em>, or <em>Scientific</em>, or use separate sheets
                with those names.
              </p>
            </>
          }
          onImport={handleExcelImport}
          onDownloadTemplate={() => downloadCommitteeTemplate("multi")}
          disabled={saving}
        />

        <div className="dash-card overflow-hidden">
          <div className="flex items-start gap-3 px-5 py-4 border-b border-dash-border bg-white">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-dash-primary">
              <HiOutlineUserGroup className="w-5 h-5" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-bold text-dash-text">{activeMeta.label}</h2>
                {isDirty && (
                  <span className="rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-800">
                    Unsaved changes
                  </span>
                )}
              </div>
              <p className="text-sm text-dash-muted mt-0.5">{activeMeta.description}</p>
            </div>
          </div>

          {filteredMembers.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <HiOutlineUserGroup className="mx-auto w-10 h-10 text-dash-muted/50 mb-3" aria-hidden="true" />
              <p className="text-sm text-dash-muted mb-4">
                {activeMembers.length === 0
                  ? `No members in ${activeMeta.label} yet.`
                  : "No members match your search or filter."}
              </p>
              {activeMembers.length === 0 && (
                <DashButton type="button" variant="secondary" onClick={openCreate}>
                  <HiOutlinePlus className="w-4 h-4" aria-hidden="true" />
                  Add first member
                </DashButton>
              )}
            </div>
          ) : (
            <ul className="divide-y divide-dash-border">
              {filteredMembers.map((member) => {
                const globalIndex = activeMembers.findIndex((m) => m.id === member.id);
                const enabled = member.enabled !== false;
                const isDragging = draggingId === member.id;
                const isDropTarget = dragOverId === member.id && draggingId !== member.id;

                return (
                  <li
                    key={member.id}
                    draggable={canReorder}
                    onDragStart={() => canReorder && handleDragStart(member.id)}
                    onDragOver={(e) => canReorder && handleDragOver(e, member.id)}
                    onDragEnd={() => canReorder && handleDragEnd()}
                    className={`flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-4 transition-colors duration-200 ${
                      isDragging ? "opacity-40 bg-blue-50/50" : ""
                    } ${
                      isDropTarget
                        ? "bg-blue-50/80 ring-2 ring-inset ring-dash-primary/30"
                        : "hover:bg-blue-50/30"
                    } ${!enabled ? "opacity-70" : ""}`}
                  >
                    <button
                      type="button"
                      disabled={!canReorder}
                      className={`shrink-0 p-1.5 rounded-lg text-dash-muted dash-focus-ring ${
                        canReorder
                          ? "hover:text-dash-text cursor-grab active:cursor-grabbing"
                          : "opacity-30 cursor-not-allowed"
                      }`}
                      aria-label={`Drag to reorder ${member.name}`}
                      onMouseDown={(e) => e.stopPropagation()}
                    >
                      <HiOutlineBars3 className="w-5 h-5" aria-hidden="true" />
                    </button>

                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-50 text-dash-primary font-bold text-sm">
                      {memberInitial(member.name)}
                    </span>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-dash-text truncate">
                          {member.name}
                        </p>
                        {!enabled && (
                          <span className="rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-800">
                            Hidden
                          </span>
                        )}
                      </div>
                      {member.affiliation?.trim() && (
                        <p className="mt-0.5 flex items-start gap-1.5 text-xs text-dash-muted">
                          <HiOutlineGlobeAlt
                            className="w-3.5 h-3.5 shrink-0 text-dash-primary mt-0.5"
                            aria-hidden="true"
                          />
                          <span className="line-clamp-2">{member.affiliation}</span>
                        </p>
                      )}
                      {activeMeta.showEmail && member.email?.trim() && (
                        <p className="mt-0.5 text-xs text-dash-muted truncate">{member.email}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <DashToggle
                        id={`committee-${member.id}`}
                        enabled={enabled}
                        onChange={(next) =>
                          updateList(
                            activeTab,
                            activeMembers.map((m) =>
                              m.id === member.id ? { ...m, enabled: next } : m
                            )
                          )
                        }
                        ariaLabel={enabled ? "Hide member" : "Show member"}
                      />
                      <button
                        type="button"
                        onClick={() => openEdit(member)}
                        className="p-2 rounded-lg text-dash-muted hover:text-dash-primary hover:bg-blue-50 transition-colors duration-200 cursor-pointer dash-focus-ring"
                        aria-label={`Edit ${member.name}`}
                      >
                        <HiOutlinePencilSquare className="w-4 h-4" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        disabled={globalIndex === 0}
                        onClick={() =>
                          updateList(activeTab, moveItem(activeMembers, globalIndex, -1))
                        }
                        className="hidden sm:block p-2 rounded-lg text-dash-muted hover:text-dash-primary hover:bg-blue-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-200 cursor-pointer dash-focus-ring"
                        aria-label="Move up"
                      >
                        <HiOutlineChevronUp className="w-4 h-4" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        disabled={globalIndex >= activeMembers.length - 1}
                        onClick={() =>
                          updateList(activeTab, moveItem(activeMembers, globalIndex, 1))
                        }
                        className="hidden sm:block p-2 rounded-lg text-dash-muted hover:text-dash-primary hover:bg-blue-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-200 cursor-pointer dash-focus-ring"
                        aria-label="Move down"
                      >
                        <HiOutlineChevronDown className="w-4 h-4" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemove(member)}
                        className="p-2 rounded-lg text-dash-muted hover:text-red-600 hover:bg-red-50 transition-colors duration-200 cursor-pointer dash-focus-ring"
                        aria-label={`Remove ${member.name}`}
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

        {visiblePreview.length > 0 && (
          <div className="rounded-xl border border-dash-border bg-white p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-dash-muted mb-3">
              Site preview — {activeMeta.label}
            </p>
            <ul className="space-y-3">
              {visiblePreview.map((member) => (
                <li key={member.id} className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-dash-primary font-bold text-sm">
                    {memberInitial(member.name)}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-dash-text truncate">{member.name}</p>
                    {member.affiliation?.trim() && (
                      <p className="mt-0.5 flex items-start gap-1.5 text-xs text-dash-muted">
                        <HiOutlineGlobeAlt
                          className="w-3.5 h-3.5 shrink-0 text-dash-primary mt-0.5"
                          aria-hidden="true"
                        />
                        <span className="line-clamp-2">{member.affiliation}</span>
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
            {getVisibleMembers(activeMembers).length > 5 && (
              <p className="mt-3 text-xs text-dash-muted">
                + {getVisibleMembers(activeMembers).length - 5} more visible on the site
              </p>
            )}
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="flex flex-wrap items-center gap-3">
        <DashButton type="submit" disabled={saving || !isDirty}>
          {saving ? "Saving…" : "Save changes"}
        </DashButton>
        {isDirty && (
          <DashButton type="button" variant="secondary" onClick={handleDiscard}>
            Discard
          </DashButton>
        )}
      </form>

      <DashModal
        title={isEditing ? "Edit member" : "Add member"}
        open={modalOpen}
        onClose={closeModal}
      >
        <form onSubmit={handleMemberSave} className="space-y-4">
          {modalError && (
            <p className="text-sm text-red-600" role="alert">
              {modalError}
            </p>
          )}
          <DashInput
            label="Name"
            value={memberForm.name ?? ""}
            onChange={(e) => setMemberForm((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="Prof. Jane Doe"
            required
          />
          <DashTextarea
            label="Affiliation"
            value={memberForm.affiliation ?? ""}
            onChange={(e) => setMemberForm((prev) => ({ ...prev, affiliation: e.target.value }))}
            rows={3}
            placeholder="University, City, Country"
          />
          {activeMeta.showEmail && (
            <DashInput
              label="Email (optional)"
              type="email"
              value={memberForm.email ?? ""}
              onChange={(e) => setMemberForm((prev) => ({ ...prev, email: e.target.value }))}
              placeholder="name@university.edu"
            />
          )}
          <div className="flex items-center justify-between rounded-xl border border-dash-border bg-dash-bg/30 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-dash-text">Visible on site</p>
              <p className="text-xs text-dash-muted mt-0.5">Hidden members stay in the dashboard only.</p>
            </div>
            <DashToggle
              id="modal-member-enabled"
              enabled={memberForm.enabled !== false}
              onChange={(enabled) => setMemberForm((prev) => ({ ...prev, enabled }))}
              ariaLabel="Toggle visibility"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <DashButton type="submit">{isEditing ? "Save member" : "Add member"}</DashButton>
            <DashButton type="button" variant="secondary" onClick={closeModal}>
              Cancel
            </DashButton>
          </div>
        </form>
      </DashModal>

      {isDirty && (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-dash-border bg-white/95 backdrop-blur-md px-4 py-3 sm:px-6 lg:left-64">
          <div className="flex flex-wrap items-center justify-between gap-3 max-w-5xl">
            <p className="text-sm text-dash-text">Unsaved committee changes</p>
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
