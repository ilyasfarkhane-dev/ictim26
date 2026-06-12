/** Normalize homepage section visibility (legacy defaults to enabled). */
export function normalizeSectionSettings(settings) {
  return {
    workshops: {
      enabled: settings?.workshops?.enabled !== false,
    },
    sponsors: {
      enabled: settings?.sponsors?.enabled !== false,
    },
    callForPapers: {
      enabled: settings?.callForPapers?.enabled !== false,
    },
    submissionGuidelines: {
      enabled: settings?.submissionGuidelines?.enabled !== false,
    },
    registrationFees: {
      enabled: settings?.registrationFees?.enabled !== false,
    },
    committees: {
      enabled: settings?.committees?.enabled !== false,
    },
  };
}

export function isWorkshopsSectionEnabled(settings) {
  return settings?.workshops?.enabled !== false;
}

export function isSponsorsSectionEnabled(settings) {
  return settings?.sponsors?.enabled !== false;
}

export function isCallForPapersSectionEnabled(settings) {
  return settings?.callForPapers?.enabled !== false;
}

export function isSubmissionGuidelinesSectionEnabled(settings) {
  return settings?.submissionGuidelines?.enabled !== false;
}

export function isRegistrationFeesSectionEnabled(settings) {
  return settings?.registrationFees?.enabled !== false;
}

export function isCommitteesSectionEnabled(settings) {
  return settings?.committees?.enabled !== false;
}
