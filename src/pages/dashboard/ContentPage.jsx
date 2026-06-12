import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  HiOutlineMegaphone,
  HiOutlineClipboardDocumentList,
  HiOutlineCreditCard,
  HiOutlineArrowTopRightOnSquare,
  HiOutlineSparkles,
  HiOutlineChevronRight,
  HiOutlineChevronDown,
  HiOutlineChevronUp,
  HiOutlineEye,
  HiOutlineEyeSlash,
  HiOutlineCheckCircle,
  HiOutlineAcademicCap,
  HiOutlineTag,
  HiOutlinePlus,
  HiOutlineTrash,
  HiOutlineUserGroup,
} from "react-icons/hi2";
import DashButton from "../../components/dashboard/DashButton";
import DashToggle from "../../components/dashboard/DashToggle";
import StatusBanner from "../../components/dashboard/StatusBanner";
import LineListEditor, { normalizeLineList } from "../../components/dashboard/LineListEditor";
import { DashInput, DashTextarea } from "../../components/dashboard/DashInput";
import { useConference } from "../../hooks/useConference";
import { upsertSetting } from "../../lib/contentApi";
import { withBase } from "../../config/paths";
import { DEFAULT_CTA_LABEL } from "../../lib/callForPapers";
import { emptyPlan, normalizeRegistrationPricing } from "../../lib/registrationPricing";
import {
  isCallForPapersSectionEnabled,
  isSubmissionGuidelinesSectionEnabled,
  isRegistrationFeesSectionEnabled,
} from "../../lib/sectionSettings";

const CONTENT_SECTIONS = [
  {
    key: "call_for_papers",
    field: "callForPapers",
    sectionSettingKey: "callForPapers",
    label: "Call for Papers",
    description: "Intro text and publication / submission lists.",
    icon: HiOutlineMegaphone,
    anchor: "#call-for-papers",
    isVisible: isCallForPapersSectionEnabled,
  },
  {
    key: "submission_guidelines",
    field: "submissionGuidelines",
    sectionSettingKey: "submissionGuidelines",
    label: "Submission Guidelines",
    description: "Three pillars plus ethics checklists.",
    icon: HiOutlineClipboardDocumentList,
    anchor: "#submission-guidelines",
    isVisible: isSubmissionGuidelinesSectionEnabled,
  },
  {
    key: "registration_pricing",
    field: "registrationPricing",
    sectionSettingKey: "registrationFees",
    label: "Registration Pricing",
    description: "Registration fee cards shown in Step 1.",
    icon: HiOutlineCreditCard,
    anchor: "#register-pricing",
    isVisible: isRegistrationFeesSectionEnabled,
  },
];

const PILLAR_ICONS = [
  { id: "platform", label: "Upload" },
  { id: "format", label: "Document" },
  { id: "requirements", label: "Checklist" },
];

const RELATED_PAGES = [
  { to: "/dashboard/hero", label: "Hero", icon: HiOutlineSparkles },
  { to: "/dashboard/workshops", label: "Workshops", icon: HiOutlineAcademicCap },
  { to: "/dashboard/topics", label: "Topics", icon: HiOutlineTag },
];

function cloneData(value) {
  return JSON.parse(JSON.stringify(value ?? {}));
}

function ensureList(items) {
  return items?.length ? items : [""];
}

function getSectionStats(sectionKey, form) {
  switch (sectionKey) {
    case "call_for_papers":
      return [
        { label: "Publication", value: normalizeLineList(form.publication).length },
        { label: "Requirements", value: normalizeLineList(form.requirements).length },
        { label: "CTA", value: form.cta?.label?.trim() || DEFAULT_CTA_LABEL },
      ];
    case "submission_guidelines":
      return [
        { label: "Pillars", value: form.pillars?.length ?? 0 },
        { label: "Criteria", value: normalizeLineList(form.evaluationCriteria).length },
        { label: "Integrity", value: normalizeLineList(form.plagiarismIntegrity).length },
      ];
    case "registration_pricing": {
      const plans = normalizeRegistrationPricing(form).plans;
      const visible = plans.filter((p) => p.enabled !== false);
      const prices = visible.map((p) => Number(p.price)).filter((n) => Number.isFinite(n));
      const minPrice = prices.length ? Math.min(...prices) : 0;
      const maxPrice = prices.length ? Math.max(...prices) : 0;
      const currency = visible[0]?.currency ?? plans[0]?.currency ?? "";
      const priceRange =
        prices.length > 1 && minPrice !== maxPrice
          ? `${minPrice}–${maxPrice} ${currency}`.trim()
          : `${minPrice} ${currency}`.trim();
      return [
        { label: "Cards", value: plans.length },
        { label: "Visible", value: visible.length },
        { label: "From", value: priceRange || "—" },
      ];
    }
    default:
      return [];
  }
}

function prepareFormForSave(sectionKey, form) {
  if (sectionKey === "call_for_papers") {
    return {
      ...form,
      publication: normalizeLineList(form.publication),
      requirements: normalizeLineList(form.requirements),
      cta: {
        label: form.cta?.label?.trim() || DEFAULT_CTA_LABEL,
        href: form.cta?.href?.trim() || "",
      },
    };
  }
  if (sectionKey === "submission_guidelines") {
    return {
      ...form,
      pillars: (form.pillars ?? []).map((p) => ({
        ...p,
        items: normalizeLineList(p.items),
      })),
      evaluationCriteria: normalizeLineList(form.evaluationCriteria),
      plagiarismIntegrity: normalizeLineList(form.plagiarismIntegrity),
    };
  }
  if (sectionKey === "registration_pricing") {
    const { plans } = normalizeRegistrationPricing(form);
    return {
      plans: plans.map((plan, index) => ({
        ...plan,
        id: plan.id || `plan-${index + 1}`,
        title: plan.title?.trim() || `Plan ${index + 1}`,
        badge: plan.badge?.trim() ?? "",
        currency: plan.currency?.trim() || "MAD",
        price: Number.isFinite(Number(plan.price)) ? Number(plan.price) : 0,
        enabled: plan.enabled !== false,
        features: normalizeLineList(plan.features),
      })),
    };
  }
  return form;
}

function hydrateFormForEdit(sectionKey, raw) {
  const form = cloneData(raw);
  if (sectionKey === "call_for_papers") {
    form.publication = ensureList(form.publication);
    form.requirements = ensureList(form.requirements);
    form.cta = {
      label: form.cta?.label ?? DEFAULT_CTA_LABEL,
      href: form.cta?.href ?? "",
    };
  }
  if (sectionKey === "submission_guidelines") {
    form.pillars = (form.pillars ?? []).map((p) => ({
      ...p,
      items: ensureList(p.items),
    }));
    form.evaluationCriteria = ensureList(form.evaluationCriteria);
    form.plagiarismIntegrity = ensureList(form.plagiarismIntegrity);
  }
  if (sectionKey === "registration_pricing") {
    const normalized = normalizeRegistrationPricing(form);
    form.plans = normalized.plans.map((plan) => ({
      ...plan,
      features: ensureList(plan.features),
    }));
    delete form.plan;
    if (!form.plans.length) {
      form.plans = [{ ...emptyPlan(), features: [""] }];
    }
  }
  return form;
}

function SectionNavButton({ section, isActive, onSelect }) {
  const Icon = section.icon;
  return (
    <button
      type="button"
      onClick={() => onSelect(section.key)}
      className={`shrink-0 lg:w-full flex items-center gap-2 lg:gap-3 rounded-xl px-3 py-2.5 lg:py-3 text-left transition-colors duration-200 cursor-pointer dash-focus-ring ${
        isActive
          ? "bg-dash-primary text-white shadow-sm"
          : "bg-white border border-dash-border text-dash-text hover:bg-blue-50/80 hover:border-dash-primary/20"
      }`}
    >
      <Icon
        className={`w-5 h-5 shrink-0 ${isActive ? "text-white" : "text-dash-primary"}`}
        aria-hidden="true"
      />
      <span className="min-w-0 hidden sm:inline lg:block">
        <span className="block text-sm font-semibold whitespace-nowrap lg:whitespace-normal">
          {section.label}
        </span>
        <span
          className={`hidden lg:block text-xs mt-0.5 leading-snug ${
            isActive ? "text-white/80" : "text-dash-muted"
          }`}
        >
          {section.description}
        </span>
      </span>
      <span className="sm:hidden text-sm font-semibold">{section.label.split(" ")[0]}</span>
    </button>
  );
}

function ContentPreview({ sectionKey, form }) {
  if (sectionKey === "call_for_papers") {
    const pubs = normalizeLineList(form.publication);
    const reqs = normalizeLineList(form.requirements);
    return (
      <div className="rounded-xl border border-dash-border bg-dash-bg/40 p-4 space-y-3">
        <p className="text-[10px] font-bold uppercase tracking-wider text-dash-primary">Preview</p>
        <p className="text-sm text-dash-text leading-relaxed line-clamp-4">
          {form.intro || "Introduction text will appear here…"}
        </p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-lg bg-white border border-dash-border p-2">
            <p className="font-semibold text-dash-text">Publication</p>
            <p className="text-dash-muted mt-1">{pubs.length} items</p>
          </div>
          <div className="rounded-lg bg-white border border-dash-border p-2">
            <p className="font-semibold text-dash-text">Requirements</p>
            <p className="text-dash-muted mt-1">{reqs.length} items</p>
          </div>
        </div>
        {(form.cta?.label || form.cta?.href) && (
          <div className="pt-1">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-dash-muted mb-2">
              Primary button
            </p>
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-dash-primary px-3 py-2 text-xs font-semibold text-white">
              {form.cta?.label?.trim() || DEFAULT_CTA_LABEL}
              <HiOutlineArrowTopRightOnSquare className="w-3.5 h-3.5 opacity-90" aria-hidden="true" />
            </span>
            {form.cta?.href && (
              <p className="mt-2 text-[10px] text-dash-muted truncate" title={form.cta.href}>
                {form.cta.href}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }

  if (sectionKey === "registration_pricing") {
    const plans = normalizeRegistrationPricing(form).plans.filter((p) => p.enabled !== false);
    return (
      <div className="rounded-xl border border-dash-border bg-dash-bg/40 p-4 space-y-3">
        <p className="text-[10px] font-bold uppercase tracking-wider text-dash-primary">Preview</p>
        {plans.length === 0 ? (
          <p className="text-xs text-dash-muted py-4 text-center rounded-lg border border-dashed border-dash-border bg-white">
            No visible pricing cards
          </p>
        ) : (
          <div className="space-y-3">
            {plans.map((plan, i) => (
              <div
                key={plan.id ?? i}
                className="rounded-xl border border-dash-border bg-white p-3 shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-dash-primary">
                      <HiOutlineUserGroup className="w-4 h-4" aria-hidden="true" />
                    </span>
                    <span className="text-xs font-bold uppercase text-dash-text truncate">
                      {plan.title || "Plan"}
                    </span>
                  </div>
                  {plan.badge && (
                    <span className="shrink-0 rounded-full bg-dash-primary px-2 py-0.5 text-[10px] font-bold text-white">
                      {plan.badge}
                    </span>
                  )}
                </div>
                <p className="mt-2 text-xl font-bold text-dash-primary tabular-nums">
                  <span className="text-xs font-medium text-dash-muted">{plan.currency}</span>{" "}
                  {plan.price ?? 0}
                </p>
                <ul className="mt-3 space-y-1">
                  {normalizeLineList(plan.features)
                    .slice(0, 3)
                    .map((f) => (
                      <li key={f} className="flex items-start gap-1.5 text-[10px] text-dash-muted">
                        <HiOutlineCheckCircle className="w-3 h-3 shrink-0 text-dash-primary mt-0.5" />
                        <span className="line-clamp-1">{f}</span>
                      </li>
                    ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (sectionKey === "submission_guidelines") {
    return (
      <div className="rounded-xl border border-dash-border bg-dash-bg/40 p-4 space-y-2">
        <p className="text-[10px] font-bold uppercase tracking-wider text-dash-primary">Preview</p>
        {(form.pillars ?? []).map((p, i) => (
          <div key={p.id ?? i} className="rounded-lg bg-white border border-dash-border px-3 py-2">
            <p className="text-xs font-semibold text-dash-text truncate">{p.title || `Pillar ${i + 1}`}</p>
            <p className="text-[10px] text-dash-muted mt-0.5">
              {normalizeLineList(p.items).length} bullet points
            </p>
          </div>
        ))}
      </div>
    );
  }

  return null;
}

function CallForPapersEditor({ form, setForm }) {
  const cta = form.cta ?? { label: DEFAULT_CTA_LABEL, href: "" };

  const updateCta = (patch) => {
    setForm({ ...form, cta: { ...cta, ...patch } });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <DashTextarea
          label="Introduction"
          value={form.intro ?? ""}
          onChange={(e) => setForm({ ...form, intro: e.target.value })}
          rows={4}
          placeholder="ICTIM'26 invites original and unpublished research contributions…"
        />
        <p className="text-xs text-dash-muted text-right tabular-nums">
          {(form.intro ?? "").length} characters
        </p>
      </div>

      <div className="rounded-xl border border-dash-border bg-dash-bg/30 p-4 space-y-4">
        <div>
          <p className="text-sm font-semibold text-dash-text">Primary button</p>
          <p className="text-xs text-dash-muted mt-0.5">
            The main call-to-action below the introduction on the Call for Papers section.
          </p>
        </div>
        <DashInput
          label="Button label"
          value={cta.label ?? ""}
          onChange={(e) => updateCta({ label: e.target.value })}
          placeholder={DEFAULT_CTA_LABEL}
        />
        <DashInput
          label="Button link"
          value={cta.href ?? ""}
          onChange={(e) => updateCta({ href: e.target.value })}
          placeholder="https://www.conference-tim.com/"
        />
      </div>

      <LineListEditor
        label="Publication highlights"
        hint="Shown in the Publication card on the Call for Papers section."
        items={form.publication ?? [""]}
        onChange={(items) => setForm({ ...form, publication: items })}
        placeholder="Peer-reviewed proceedings in Springer's CCIS series"
      />
      <LineListEditor
        label="Submission requirements"
        hint="Shown in the Submission Requirements card."
        items={form.requirements ?? [""]}
        onChange={(items) => setForm({ ...form, requirements: items })}
        placeholder="A4 IEEE template (Word/LaTeX guidelines)"
      />
    </div>
  );
}

function PricingPlanCard({
  plan,
  index,
  total,
  expanded,
  onToggle,
  onUpdate,
  onUpdateFeatures,
  onRemove,
  onMoveUp,
  onMoveDown,
}) {
  if (!plan) return null;

  const features = normalizeLineList(plan.features);

  return (
    <div
      className={`rounded-xl border bg-white overflow-hidden transition-colors duration-200 ${
        plan.enabled === false ? "border-dashed border-dash-border opacity-75" : "border-dash-border"
      }`}
    >
      <div className="flex items-stretch">
        <button
          type="button"
          onClick={onToggle}
          className="flex-1 min-w-0 flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-blue-50/50 transition-colors duration-200 cursor-pointer dash-focus-ring"
          aria-expanded={expanded}
        >
          <div className="flex items-center gap-3 min-w-0">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-dash-primary">
              <HiOutlineUserGroup className="w-5 h-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-wider text-dash-primary">
                Card {index + 1}
                {plan.enabled === false && (
                  <span className="ml-2 normal-case font-medium text-dash-muted">(hidden)</span>
                )}
              </p>
              <p className="text-sm font-semibold text-dash-text truncate mt-0.5">
                {plan.title || "Untitled plan"}
              </p>
              <p className="text-xs text-dash-muted mt-0.5 tabular-nums">
                {plan.currency || "MAD"} {plan.price ?? 0}
                {plan.badge ? ` · ${plan.badge}` : ""}
              </p>
            </div>
          </div>
          <HiOutlineChevronDown
            className={`w-5 h-5 shrink-0 text-dash-muted transition-transform duration-200 ${
              expanded ? "rotate-180" : ""
            }`}
            aria-hidden="true"
          />
        </button>

        <div className="flex flex-col border-l border-dash-border">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={index === 0}
            className="flex-1 px-2.5 text-dash-muted hover:text-dash-primary hover:bg-blue-50/80 disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-200 cursor-pointer dash-focus-ring"
            aria-label="Move card up"
          >
            <HiOutlineChevronUp className="w-4 h-4 mx-auto" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={index >= total - 1}
            className="flex-1 px-2.5 text-dash-muted hover:text-dash-primary hover:bg-blue-50/80 disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-200 cursor-pointer dash-focus-ring border-t border-dash-border"
            aria-label="Move card down"
          >
            <HiOutlineChevronDown className="w-4 h-4 mx-auto" aria-hidden="true" />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 pt-1 space-y-4 border-t border-dash-border bg-dash-bg/20">
          <div className="flex items-center justify-between gap-3 rounded-lg border border-dash-border bg-white px-3 py-2.5">
            <div>
              <p className="text-sm font-medium text-dash-text">Show on website</p>
              <p className="text-xs text-dash-muted mt-0.5">Hidden cards stay saved but are not public.</p>
            </div>
            <DashToggle
              id={`pricing-plan-${plan.id ?? index}`}
              enabled={plan.enabled !== false}
              onChange={(enabled) => onUpdate({ enabled })}
              ariaLabel={plan.enabled !== false ? "Hide pricing card" : "Show pricing card"}
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <DashInput
              label="Badge"
              value={plan.badge ?? ""}
              onChange={(e) => onUpdate({ badge: e.target.value })}
              placeholder="Best Plan"
            />
            <DashInput
              label="Plan title"
              value={plan.title ?? ""}
              onChange={(e) => onUpdate({ title: e.target.value })}
              placeholder="In-Person"
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <DashInput
              label="Price"
              type="number"
              min={0}
              value={plan.price ?? ""}
              onChange={(e) => onUpdate({ price: Number(e.target.value) })}
            />
            <DashInput
              label="Currency"
              value={plan.currency ?? ""}
              onChange={(e) => onUpdate({ currency: e.target.value })}
              placeholder="MAD"
            />
          </div>
          <LineListEditor
            label="Included features"
            hint="Each line becomes a checkmark on the public registration card."
            items={plan.features ?? [""]}
            onChange={onUpdateFeatures}
            placeholder="Communication Certificate"
          />

          <div className="rounded-xl border border-dash-border bg-white p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-dash-muted mb-3">
              Card preview
            </p>
            <div className="max-w-xs">
              <div className="flex items-start justify-between gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-dash-primary">
                  <HiOutlineUserGroup className="w-4 h-4" aria-hidden="true" />
                </span>
                {plan.badge && (
                  <span className="rounded-full bg-dash-primary px-2 py-0.5 text-[10px] font-bold text-white">
                    {plan.badge}
                  </span>
                )}
              </div>
              <p className="mt-3 text-xs font-bold uppercase tracking-wide text-dash-text">
                {plan.title || "Plan title"}
              </p>
              <p className="mt-1 text-2xl font-bold text-dash-primary tabular-nums">
                <span className="text-sm font-medium text-dash-muted">{plan.currency || "MAD"}</span>{" "}
                {plan.price ?? 0}
              </p>
              <ul className="mt-3 space-y-1">
                {features.slice(0, 4).map((f) => (
                  <li key={f} className="flex items-start gap-1.5 text-[10px] text-dash-muted">
                    <HiOutlineCheckCircle className="w-3 h-3 shrink-0 text-dash-primary mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {total > 1 && (
            <button
              type="button"
              onClick={onRemove}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-red-600 hover:text-red-700 transition-colors duration-200 cursor-pointer dash-focus-ring"
            >
              <HiOutlineTrash className="w-4 h-4" aria-hidden="true" />
              Remove card
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function RegistrationPricingEditor({ form, setForm }) {
  const [expanded, setExpanded] = useState(() => new Set([0]));
  const plans = normalizeRegistrationPricing(form).plans;

  const togglePlan = (index) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const updatePlans = (nextPlans) => {
    setForm({ ...form, plans: nextPlans });
  };

  const updatePlan = (index, patch) => {
    updatePlans(plans.map((p, i) => (i === index ? { ...p, ...patch } : p)));
  };

  const addPlan = () => {
    const next = [...plans, emptyPlan(plans.length)];
    updatePlans(next);
    setExpanded((prev) => new Set([...prev, next.length - 1]));
  };

  const removePlan = (index) => {
    if (plans.length <= 1) return;
    if (!window.confirm("Remove this pricing card?")) return;
    updatePlans(plans.filter((_, i) => i !== index));
    setExpanded((prev) => {
      const next = new Set();
      prev.forEach((i) => {
        if (i < index) next.add(i);
        else if (i > index) next.add(i - 1);
      });
      return next;
    });
  };

  const movePlan = (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= plans.length) return;
    const next = [...plans];
    [next[index], next[target]] = [next[target], next[index]];
    updatePlans(next);
    setExpanded((prev) => {
      const nextExpanded = new Set();
      prev.forEach((i) => {
        if (i === index) nextExpanded.add(target);
        else if (i === target) nextExpanded.add(index);
        else nextExpanded.add(i);
      });
      return nextExpanded;
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-dash-text">Registration cards</p>
          <p className="text-xs text-dash-muted mt-0.5">
            Each card appears in the Conference Registration Fees section on the homepage.
          </p>
        </div>
        <DashButton type="button" variant="secondary" onClick={addPlan} className="shrink-0">
          <HiOutlinePlus className="w-4 h-4" aria-hidden="true" />
          Add card
        </DashButton>
      </div>

      <div className="space-y-3">
        {plans.map((plan, index) => (
          <PricingPlanCard
            key={plan.id ?? index}
            plan={plan}
            index={index}
            total={plans.length}
            expanded={expanded.has(index)}
            onToggle={() => togglePlan(index)}
            onUpdate={(patch) => updatePlan(index, patch)}
            onUpdateFeatures={(items) => updatePlan(index, { features: items })}
            onRemove={() => removePlan(index)}
            onMoveUp={() => movePlan(index, -1)}
            onMoveDown={() => movePlan(index, 1)}
          />
        ))}
      </div>

      <p className="text-xs text-dash-muted rounded-lg border border-dashed border-dash-border bg-dash-bg/30 px-3 py-2">
        Workshop cards are managed on the{" "}
        <Link
          to="/dashboard/workshops"
          className="text-dash-primary font-medium hover:underline cursor-pointer"
        >
          Workshops
        </Link>{" "}
        page.
      </p>
    </div>
  );
}

function PillarCard({ pillar, index, expanded, onToggle, onUpdate, onUpdateItems }) {
  return (
    <div className="rounded-xl border border-dash-border bg-white overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-blue-50/50 transition-colors duration-200 cursor-pointer dash-focus-ring"
        aria-expanded={expanded}
      >
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wider text-dash-primary">
            Pillar {index + 1}
          </p>
          <p className="text-sm font-semibold text-dash-text truncate mt-0.5">
            {pillar.title || "Untitled pillar"}
          </p>
        </div>
        <HiOutlineChevronDown
          className={`w-5 h-5 shrink-0 text-dash-muted transition-transform duration-200 ${
            expanded ? "rotate-180" : ""
          }`}
          aria-hidden="true"
        />
      </button>

      {expanded && (
        <div className="px-4 pb-4 pt-1 space-y-3 border-t border-dash-border bg-dash-bg/20">
          <div className="grid sm:grid-cols-2 gap-3">
            <DashInput
              label="Title"
              value={pillar.title ?? ""}
              onChange={(e) => onUpdate({ title: e.target.value })}
            />
            <DashInput
              label="Pill label"
              value={pillar.pill ?? ""}
              onChange={(e) => onUpdate({ pill: e.target.value })}
            />
          </div>
          <DashInput
            label="Pill link"
            value={pillar.pillHref ?? ""}
            onChange={(e) => onUpdate({ pillHref: e.target.value })}
            placeholder="https://… or #call-for-papers"
          />
          <div className="space-y-2">
            <span className="block text-sm font-medium text-dash-text">Icon</span>
            <div className="flex flex-wrap gap-2">
              {PILLAR_ICONS.map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => onUpdate({ icon: id })}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors duration-200 cursor-pointer dash-focus-ring ${
                    pillar.icon === id
                      ? "border-dash-primary bg-blue-50 text-dash-primary"
                      : "border-dash-border bg-white text-dash-muted hover:border-dash-primary/30"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <LineListEditor
            label="Bullet points"
            items={pillar.items ?? [""]}
            onChange={onUpdateItems}
            placeholder="Easy manuscript upload"
          />
        </div>
      )}
    </div>
  );
}

function SubmissionGuidelinesEditor({ form, setForm }) {
  const [expanded, setExpanded] = useState(() => new Set([0, 1, 2]));
  const pillars = form.pillars ?? [];

  const togglePillar = (index) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const updatePillar = (index, patch) => {
    setForm({
      ...form,
      pillars: pillars.map((p, i) => (i === index ? { ...p, ...patch } : p)),
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <p className="text-sm font-semibold text-dash-text">Guideline pillars</p>
        {pillars.map((pillar, index) => (
          <PillarCard
            key={pillar.id ?? index}
            pillar={pillar}
            index={index}
            expanded={expanded.has(index)}
            onToggle={() => togglePillar(index)}
            onUpdate={(patch) => updatePillar(index, patch)}
            onUpdateItems={(items) => updatePillar(index, { items })}
          />
        ))}
      </div>

      <LineListEditor
        label="Evaluation criteria"
        items={form.evaluationCriteria ?? [""]}
        onChange={(items) => setForm({ ...form, evaluationCriteria: items })}
        placeholder="Novelty & originality of contributions"
      />
      <LineListEditor
        label="Plagiarism & integrity"
        items={form.plagiarismIntegrity ?? [""]}
        onChange={(items) => setForm({ ...form, plagiarismIntegrity: items })}
        placeholder="Mandatory plagiarism screening"
      />
    </div>
  );
}

function renderEditor(sectionKey, form, setForm) {
  switch (sectionKey) {
    case "call_for_papers":
      return <CallForPapersEditor form={form} setForm={setForm} />;
    case "submission_guidelines":
      return <SubmissionGuidelinesEditor form={form} setForm={setForm} />;
    case "registration_pricing":
      return <RegistrationPricingEditor form={form} setForm={setForm} />;
    default:
      return null;
  }
}

export default function ContentPage() {
  const data = useConference();
  const { sectionSettings, refresh } = data;
  const [active, setActive] = useState(CONTENT_SECTIONS[0].key);
  const [savedForm, setSavedForm] = useState({});
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [togglingSection, setTogglingSection] = useState(false);
  const [message, setMessage] = useState("");

  const activeMeta = CONTENT_SECTIONS.find((s) => s.key === active) ?? CONTENT_SECTIONS[0];
  const ActiveIcon = activeMeta.icon;
  const sectionVisible = activeMeta.isVisible(sectionSettings);
  const stats = useMemo(() => getSectionStats(active, form), [active, form]);

  const loadSection = (key) => {
    const section = CONTENT_SECTIONS.find((s) => s.key === key) ?? CONTENT_SECTIONS[0];
    const next = hydrateFormForEdit(section.key, data[section.field]);
    setActive(section.key);
    setForm(next);
    setSavedForm(cloneData(next));
    setMessage("");
  };

  useEffect(() => {
    const section = CONTENT_SECTIONS.find((s) => s.key === active) ?? CONTENT_SECTIONS[0];
    const next = hydrateFormForEdit(section.key, data[section.field]);
    setForm(next);
    setSavedForm(cloneData(next));
  }, [active, data.source, data.callForPapers, data.submissionGuidelines, data.registrationPricing]);

  const isDirty = useMemo(
    () => JSON.stringify(prepareFormForSave(active, form)) !== JSON.stringify(prepareFormForSave(active, savedForm)),
    [form, savedForm, active]
  );

  const selectSection = (key) => {
    if (isDirty && key !== active) {
      if (!window.confirm("Discard unsaved changes?")) return;
    }
    loadSection(key);
  };

  const toggleSectionVisibility = async (next) => {
    if (togglingSection) return;
    setTogglingSection(true);
    try {
      await upsertSetting("section_settings", {
        ...sectionSettings,
        [activeMeta.sectionSettingKey]: { enabled: next },
      });
      await refresh();
      setMessage(
        next
          ? `${activeMeta.label} section is now visible on the site.`
          : `${activeMeta.label} section hidden from the site.`
      );
    } catch (err) {
      setMessage(err.message);
    } finally {
      setTogglingSection(false);
    }
  };

  const handleDiscard = () => {
    setForm(cloneData(savedForm));
    setMessage("");
  };

  const handleSave = async (e) => {
    e?.preventDefault?.();
    setSaving(true);
    setMessage("");
    try {
      const payload = prepareFormForSave(active, form);
      await upsertSetting(active, payload);
      const hydrated = hydrateFormForEdit(active, payload);
      await refresh();
      setForm(hydrated);
      setSavedForm(cloneData(hydrated));
      setMessage(`${activeMeta.label} saved successfully.`);
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
            Homepage
          </p>
          <h1 className="text-2xl font-bold text-dash-text">Site Content</h1>
          <p className="mt-1 text-sm text-dash-muted max-w-xl">
            Edit homepage text blocks with live preview — toggle section visibility per block.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={togglingSection}
            onClick={() => toggleSectionVisibility(!sectionVisible)}
            className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors duration-200 cursor-pointer dash-focus-ring disabled:opacity-50 disabled:cursor-not-allowed ${
              sectionVisible
                ? "border-dash-border bg-white text-dash-text hover:bg-blue-50/80 hover:border-dash-primary/30"
                : "border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100"
            }`}
            aria-label={
              sectionVisible
                ? `Hide ${activeMeta.label} on website`
                : `Show ${activeMeta.label} on website`
            }
          >
            {sectionVisible ? (
              <HiOutlineEye className="w-4 h-4 text-dash-primary" aria-hidden="true" />
            ) : (
              <HiOutlineEyeSlash className="w-4 h-4 text-amber-700" aria-hidden="true" />
            )}
            {sectionVisible ? "Section visible" : "Section hidden"}
          </button>
          <a
            href={`${withBase("/")}${activeMeta.anchor}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-dash-border bg-white px-4 py-2.5 text-sm font-medium text-dash-text hover:bg-blue-50/80 hover:border-dash-primary/30 transition-colors duration-200 cursor-pointer dash-focus-ring"
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
        {stats.map((stat) => (
          <div key={stat.label} className="dash-card px-4 py-3 text-center">
            <p className="text-lg font-bold text-dash-text tabular-nums truncate">{stat.value}</p>
            <p className="text-xs text-dash-muted mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      <div
        className={`mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-xl border px-4 py-3 transition-colors duration-200 ${
          sectionVisible ? "border-dash-border bg-white" : "border-amber-200 bg-amber-50/80"
        }`}
      >
        <div className="flex items-start sm:items-center gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
              sectionVisible ? "bg-blue-50 text-dash-primary" : "bg-amber-100 text-amber-700"
            }`}
          >
            {sectionVisible ? (
              <HiOutlineEye className="w-5 h-5" aria-hidden="true" />
            ) : (
              <HiOutlineEyeSlash className="w-5 h-5" aria-hidden="true" />
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-dash-text">
              {activeMeta.label} on homepage
            </p>
            <p className="text-xs text-dash-muted mt-0.5">
              {sectionVisible
                ? "This block is live on the public site."
                : "Hidden from visitors until you re-enable it."}
            </p>
          </div>
        </div>
        <DashToggle
          id={`content-section-${active}`}
          enabled={sectionVisible}
          disabled={togglingSection}
          onChange={toggleSectionVisibility}
          ariaLabel={
            sectionVisible
              ? `Hide ${activeMeta.label} on website`
              : `Show ${activeMeta.label} on website`
          }
        />
      </div>

      <div className="mb-6 flex gap-2 overflow-x-auto pb-1 lg:hidden">
        {CONTENT_SECTIONS.map((section) => (
          <SectionNavButton
            key={section.key}
            section={section}
            isActive={active === section.key}
            onSelect={selectSection}
          />
        ))}
      </div>

      <div className="grid lg:grid-cols-[minmax(0,260px)_1fr] xl:grid-cols-[minmax(0,260px)_1fr_minmax(0,280px)] gap-6 items-start">
        <aside className="hidden lg:block space-y-3 lg:sticky lg:top-24">
          <nav className="space-y-1" aria-label="Content sections">
            {CONTENT_SECTIONS.map((section) => (
              <SectionNavButton
                key={section.key}
                section={section}
                isActive={active === section.key}
                onSelect={selectSection}
              />
            ))}
          </nav>

          <div className="pt-4 border-t border-dash-border space-y-2">
            <p className="px-1 text-[10px] font-bold uppercase tracking-wider text-dash-muted">
              Related pages
            </p>
            {RELATED_PAGES.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-dash-muted hover:text-dash-primary hover:bg-blue-50/80 transition-colors duration-200 cursor-pointer dash-focus-ring"
              >
                <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                {label}
              </Link>
            ))}
          </div>
        </aside>

        <form onSubmit={handleSave} className="dash-card p-5 sm:p-6 space-y-6 min-w-0">
          <div className="flex items-start gap-3 pb-4 border-b border-dash-border">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-dash-primary">
              <ActiveIcon className="w-5 h-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-dash-text">{activeMeta.label}</h2>
              <p className="text-sm text-dash-muted mt-0.5">{activeMeta.description}</p>
              {isDirty && (
                <span className="inline-block mt-2 rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-800">
                  Unsaved changes
                </span>
              )}
            </div>
          </div>

          {renderEditor(active, form, setForm)}

          <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-dash-border">
            <DashButton type="submit" disabled={saving || !isDirty}>
              {saving ? "Saving…" : "Save changes"}
            </DashButton>
            {isDirty && (
              <DashButton type="button" variant="secondary" onClick={handleDiscard}>
                Discard
              </DashButton>
            )}
            {!isDirty && (
              <span className="text-xs text-dash-muted">All changes saved</span>
            )}
          </div>
        </form>

        <aside className="xl:sticky xl:top-24 space-y-4">
          <ContentPreview sectionKey={active} form={form} />
          <Link
            to="/dashboard/hero"
            className="flex items-center gap-3 rounded-xl border border-dash-border bg-white px-4 py-3 hover:bg-blue-50/50 hover:border-dash-primary/20 transition-colors duration-200 cursor-pointer dash-focus-ring group"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-dash-primary">
              <HiOutlineSparkles className="w-4 h-4" aria-hidden="true" />
            </span>
            <span className="flex-1 min-w-0 text-sm font-medium text-dash-text">Hero page</span>
            <HiOutlineChevronRight
              className="w-4 h-4 text-dash-muted group-hover:text-dash-primary transition-colors duration-200"
              aria-hidden="true"
            />
          </Link>
        </aside>
      </div>

      {isDirty && (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-dash-border bg-white/95 backdrop-blur-md px-4 py-3 sm:px-6 lg:left-64">
          <div className="flex flex-wrap items-center justify-between gap-3 max-w-5xl">
            <p className="text-sm text-dash-text">
              Unsaved changes in <span className="font-semibold">{activeMeta.label}</span>
            </p>
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
