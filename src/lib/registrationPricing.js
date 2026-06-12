const DEFAULT_PLAN = {
  id: "in-person",
  badge: "Best Plan",
  title: "In-Person",
  price: 600,
  currency: "MAD",
  enabled: true,
  features: [
    "Communication Certificate",
    "Certificate of Participation",
    "Conference Materials",
    "Access to Exhibitions",
    "Lunch and Tea/Coffee Breaks",
  ],
};

function slugId(title, index) {
  const base =
    typeof title === "string"
      ? title
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "")
      : "";
  return base || `plan-${index + 1}`;
}

function normalizePlan(raw, index) {
  if (!raw || typeof raw !== "object") return null;
  const title = String(raw.title ?? "").trim() || `Plan ${index + 1}`;
  return {
    id: raw.id ?? slugId(title, index),
    badge: String(raw.badge ?? "").trim(),
    title,
    price: Number.isFinite(Number(raw.price)) ? Number(raw.price) : 0,
    currency: String(raw.currency ?? "MAD").trim() || "MAD",
    enabled: raw.enabled !== false,
    features: Array.isArray(raw.features)
      ? raw.features.map((f) => String(f).trim()).filter(Boolean)
      : [],
  };
}

function normalizePlansList(rawPlans, fallbackPlans) {
  const source = Array.isArray(rawPlans) ? rawPlans : fallbackPlans ?? [DEFAULT_PLAN];
  const plans = source.map(normalizePlan).filter(Boolean);
  return plans.length ? plans : [normalizePlan(DEFAULT_PLAN, 0)];
}

export function normalizeRegistrationPricing(data, fallback) {
  const fb = fallback ?? { plans: [DEFAULT_PLAN] };
  const fallbackPlans = fb.plans ?? (fb.plan ? [fb.plan] : [DEFAULT_PLAN]);

  if (!data || typeof data !== "object") {
    const plans = normalizePlansList(fallbackPlans, fallbackPlans);
    return { plans, plan: plans[0] };
  }

  let rawPlans = data.plans;
  if ((!Array.isArray(rawPlans) || rawPlans.length === 0) && data.plan) {
    rawPlans = [data.plan];
  }
  if (!Array.isArray(rawPlans) || rawPlans.length === 0) {
    rawPlans = fallbackPlans;
  }

  const plans = normalizePlansList(rawPlans, fallbackPlans);
  return { plans, plan: plans[0] };
}

export function getVisiblePlans(registrationPricing) {
  const normalized = normalizeRegistrationPricing(registrationPricing);
  return normalized.plans.filter((p) => p && p.enabled !== false);
}

export function emptyPlan(index = 0) {
  return {
    id: `plan-${Date.now()}-${index}`,
    badge: "",
    title: "",
    price: 0,
    currency: "MAD",
    enabled: true,
    features: [""],
  };
}
