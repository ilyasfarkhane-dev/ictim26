import { useEffect, useMemo, useState } from "react";
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
  HiOutlineBuildingOffice2,
} from "react-icons/hi2";
import DashButton from "../../components/dashboard/DashButton";
import DashToggle from "../../components/dashboard/DashToggle";
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

const TABS = [
  { id: "programChairs", label: "Program Chairs", description: "Program Committee Chairs grid" },
  {
    id: "externalReviewers",
    label: "External Reviewers",
    description: "External Reviewers & Advisors list",
  },
  { id: "organizing", label: "Organizing", description: "Organizing committee & institution" },
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

function MemberRow({
  member,
  index,
  total,
  showEmail,
  onUpdate,
  onRemove,
  onMoveUp,
  onMoveDown,
}) {
  return (
    <div
      className={`rounded-xl border bg-white overflow-hidden transition-colors duration-200 ${
        member.enabled === false ? "border-dashed border-dash-border opacity-80" : "border-dash-border"
      }`}
    >
      <div className="flex items-stretch">
        <div className="flex flex-1 min-w-0 items-start gap-3 p-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-dash-primary font-bold text-sm">
            {memberInitial(member.name)}
          </span>
          <div className="flex-1 min-w-0 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-bold uppercase tracking-wider text-dash-primary">
                Member {index + 1}
                {member.enabled === false && (
                  <span className="ml-2 normal-case font-medium text-dash-muted">(hidden)</span>
                )}
              </p>
              <DashToggle
                id={`committee-member-${member.id}`}
                enabled={member.enabled !== false}
                onChange={(enabled) => onUpdate({ enabled })}
                ariaLabel={member.enabled !== false ? "Hide member" : "Show member"}
              />
            </div>
            <DashInput
              label="Name"
              value={member.name ?? ""}
              onChange={(e) => onUpdate({ name: e.target.value })}
              placeholder="Prof. Jane Doe"
            />
            <DashTextarea
              label="Affiliation"
              value={member.affiliation ?? ""}
              onChange={(e) => onUpdate({ affiliation: e.target.value })}
              rows={2}
              placeholder="University, City, Country"
            />
            {showEmail && (
              <DashInput
                label="Email (optional)"
                type="email"
                value={member.email ?? ""}
                onChange={(e) => onUpdate({ email: e.target.value })}
                placeholder="name@university.edu"
              />
            )}
          </div>
        </div>
        <div className="flex flex-col border-l border-dash-border shrink-0">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={index === 0}
            className="flex-1 px-2.5 text-dash-muted hover:text-dash-primary hover:bg-blue-50/80 disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-200 cursor-pointer dash-focus-ring"
            aria-label="Move up"
          >
            <HiOutlineChevronUp className="w-4 h-4 mx-auto" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={index >= total - 1}
            className="flex-1 px-2.5 text-dash-muted hover:text-dash-primary hover:bg-blue-50/80 disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-200 cursor-pointer dash-focus-ring border-t border-dash-border"
            aria-label="Move down"
          >
            <HiOutlineChevronDown className="w-4 h-4 mx-auto" aria-hidden="true" />
          </button>
        </div>
      </div>
      {total > 1 && (
        <div className="px-4 pb-3 border-t border-dash-border bg-dash-bg/20">
          <button
            type="button"
            onClick={onRemove}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-red-600 hover:text-red-700 transition-colors duration-200 cursor-pointer dash-focus-ring"
          >
            <HiOutlineTrash className="w-4 h-4" aria-hidden="true" />
            Remove
          </button>
        </div>
      )}
    </div>
  );
}

function MemberListEditor({ members, prefix, showEmail, onChange }) {
  const updateMember = (index, patch) => {
    onChange(members.map((m, i) => (i === index ? { ...m, ...patch } : m)));
  };

  const addMember = () => {
    onChange([...members, emptyMember(prefix)]);
  };

  const removeMember = (index) => {
    if (members.length <= 1) return;
    if (!window.confirm("Remove this committee member?")) return;
    onChange(members.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      {members.map((member, index) => (
        <MemberRow
          key={member.id ?? index}
          member={member}
          index={index}
          total={members.length}
          showEmail={showEmail}
          onUpdate={(patch) => updateMember(index, patch)}
          onRemove={() => removeMember(index)}
          onMoveUp={() => onChange(moveItem(members, index, -1))}
          onMoveDown={() => onChange(moveItem(members, index, 1))}
        />
      ))}
      <DashButton type="button" variant="secondary" onClick={addMember}>
        <HiOutlinePlus className="w-4 h-4" aria-hidden="true" />
        Add member
      </DashButton>
    </div>
  );
}

export default function CommitteesPage() {
  const { committees: liveCommittees, sectionSettings, refresh } = useConference();
  const sectionEnabled = isCommitteesSectionEnabled(sectionSettings);
  const [activeTab, setActiveTab] = useState("programChairs");
  const [form, setForm] = useState(() => hydrateCommitteesForEdit(liveCommittees));
  const [savedForm, setSavedForm] = useState(() => hydrateCommitteesForEdit(liveCommittees));
  const [saving, setSaving] = useState(false);
  const [togglingSection, setTogglingSection] = useState(false);
  const [message, setMessage] = useState("");

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

  const stats = useMemo(() => {
    const normalized = normalizeCommittees(form);
    return {
      programChairs: getVisibleMembers(normalized.programChairs).length,
      externalReviewers: getVisibleMembers(normalized.externalReviewers).length,
      organizing: getVisibleMembers(normalized.organizing.programChairs).length,
    };
  }, [form]);

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

  const updateList = (key, list) => {
    setForm((prev) => ({ ...prev, [key]: list }));
  };

  const updateOrganizingChairs = (list) => {
    setForm((prev) => ({
      ...prev,
      organizing: { ...prev.organizing, programChairs: list },
    }));
  };

  const updateInstitution = (patch) => {
    setForm((prev) => ({
      ...prev,
      organizing: {
        ...prev.organizing,
        institution: { ...prev.organizing.institution, ...patch },
      },
    }));
  };

  const activeMeta = TABS.find((t) => t.id === activeTab) ?? TABS[0];

  return (
    <div className={isDirty ? "pb-24" : ""}>
      <div className="mb-6 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-dash-muted mb-1">
            Homepage
          </p>
          <h1 className="text-2xl font-bold text-dash-text">Committees</h1>
          <p className="mt-1 text-sm text-dash-muted max-w-xl">
            Manage program chairs, external reviewers, and the organizing committee shown on the
            homepage.
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
        </div>
      </div>

      {message && (
        <div className="mb-6">
          <StatusBanner message={message} />
        </div>
      )}

      <div className="mb-6 grid grid-cols-3 gap-3 max-w-lg">
        <div className="dash-card px-4 py-3 text-center">
          <p className="text-lg font-bold text-dash-text tabular-nums">{stats.programChairs}</p>
          <p className="text-xs text-dash-muted mt-0.5">Program chairs</p>
        </div>
        <div className="dash-card px-4 py-3 text-center">
          <p className="text-lg font-bold text-dash-text tabular-nums">{stats.externalReviewers}</p>
          <p className="text-xs text-dash-muted mt-0.5">Reviewers</p>
        </div>
        <div className="dash-card px-4 py-3 text-center">
          <p className="text-lg font-bold text-dash-text tabular-nums">{stats.organizing}</p>
          <p className="text-xs text-dash-muted mt-0.5">Organizing</p>
        </div>
      </div>

      <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`shrink-0 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors duration-200 cursor-pointer dash-focus-ring ${
              activeTab === tab.id
                ? "bg-dash-primary text-white shadow-sm"
                : "bg-white border border-dash-border text-dash-text hover:bg-blue-50/80"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSave} className="dash-card p-5 sm:p-6 space-y-6">
        <div className="flex items-start gap-3 pb-4 border-b border-dash-border">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-dash-primary">
            <HiOutlineUserGroup className="w-5 h-5" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-lg font-bold text-dash-text">{activeMeta.label}</h2>
            <p className="text-sm text-dash-muted mt-0.5">{activeMeta.description}</p>
            {isDirty && (
              <span className="inline-block mt-2 rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-800">
                Unsaved changes
              </span>
            )}
          </div>
        </div>

        {activeTab === "programChairs" && (
          <MemberListEditor
            members={form.programChairs}
            prefix="pch"
            showEmail={false}
            onChange={(list) => updateList("programChairs", list)}
          />
        )}

        {activeTab === "externalReviewers" && (
          <MemberListEditor
            members={form.externalReviewers}
            prefix="er"
            showEmail={false}
            onChange={(list) => updateList("externalReviewers", list)}
          />
        )}

        {activeTab === "organizing" && (
          <div className="space-y-8">
            <div className="space-y-3">
              <p className="text-sm font-semibold text-dash-text">Program chairs</p>
              <MemberListEditor
                members={form.organizing.programChairs}
                prefix="org-pc"
                showEmail
                onChange={updateOrganizingChairs}
              />
            </div>
            <div className="rounded-xl border border-dash-border bg-dash-bg/30 p-4 space-y-4">
              <div className="flex items-center gap-2">
                <HiOutlineBuildingOffice2 className="w-5 h-5 text-dash-primary" aria-hidden="true" />
                <p className="text-sm font-semibold text-dash-text">Organizing institution</p>
              </div>
              <DashInput
                label="Institution name"
                value={form.organizing.institution.name ?? ""}
                onChange={(e) => updateInstitution({ name: e.target.value })}
                placeholder="AM2I & LTIM & FSBM"
              />
              <DashTextarea
                label="Address"
                value={form.organizing.institution.address ?? ""}
                onChange={(e) => updateInstitution({ address: e.target.value })}
                rows={3}
                placeholder="University address"
              />
            </div>
          </div>
        )}

        <div className="rounded-xl border border-dash-border bg-white p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-dash-muted mb-3">
            Preview snippet
          </p>
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-dash-primary font-bold text-sm">
              {memberInitial(
                (activeTab === "organizing"
                  ? form.organizing.programChairs[0]?.name
                  : form[activeTab]?.[0]?.name) ?? "?"
              )}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-bold text-dash-text truncate">
                {(activeTab === "organizing"
                  ? form.organizing.programChairs[0]?.name
                  : form[activeTab]?.[0]?.name) || "Member name"}
              </p>
              <p className="mt-1 flex items-start gap-1.5 text-xs text-dash-muted">
                <HiOutlineGlobeAlt className="w-3.5 h-3.5 shrink-0 text-dash-primary mt-0.5" />
                <span className="line-clamp-2">
                  {(activeTab === "organizing"
                    ? form.organizing.programChairs[0]?.affiliation
                    : form[activeTab]?.[0]?.affiliation) || "Affiliation"}
                </span>
              </p>
            </div>
          </div>
        </div>

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
