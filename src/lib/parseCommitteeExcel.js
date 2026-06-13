import * as XLSX from "xlsx";
import { emptyMember, COMMITTEE_GROUP_IDS, COMMITTEE_TAB_PREFIX } from "./committees";

const TAB_PREFIX = COMMITTEE_TAB_PREFIX;

const NAME_KEYS = [
  "name",
  "full name",
  "fullname",
  "member",
  "member name",
  "nom",
  "nom complet",
  "nom et prénom",
  "nom et prenom",
  "prénom et nom",
  "prenom et nom",
  "nom / prénom",
  "nom / prenom",
];

const AFFILIATION_KEYS = [
  "affiliation",
  "affiliations",
  "institution",
  "organization",
  "organisation",
  "university",
  "université",
  "universite",
  "affiliation / institution",
  "institution / affiliation",
];

const EMAIL_KEYS = ["email", "e-mail", "mail", "courriel"];
const COMMITTEE_KEYS = [
  "committee",
  "type",
  "section",
  "comite",
  "comité",
  "category",
  "groupe",
  "group",
];

function normalizeHeader(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function mapRow(row) {
  const mapped = {};
  for (const [key, value] of Object.entries(row)) {
    mapped[normalizeHeader(key)] = value;
  }
  return mapped;
}

function pickValue(row, keys) {
  for (const key of keys) {
    const value = row[key];
    if (value != null && String(value).trim()) return String(value).trim();
  }
  return "";
}

function rowHasAnyKey(row, keys) {
  return keys.some((key) => key in row);
}

/** Map committee labels from cells or sheet names to internal keys. */
export function resolveCommitteeType(raw) {
  const value = String(raw ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  if (!value) return null;

  if (
    value.includes("honorary") ||
    value.includes("honoraire") ||
    value === "hon-ch"
  ) {
    return "honoraryChairs";
  }

  if (
    (value.includes("conference") && value.includes("co-chair")) ||
    value.includes("co-chair") ||
    value.includes("co chair") ||
    value.includes("cochair") ||
    value === "conf-co-ch"
  ) {
    return "conferenceCoChair";
  }

  if (
    (value.includes("conference") && value.includes("chair") && !value.includes("co")) ||
    value === "conf-ch" ||
    value === "general chair"
  ) {
    return "conferenceChair";
  }

  if (
    value.includes("sponsor") ||
    value.includes("exhibit") ||
    value === "spon-ch"
  ) {
    return "sponsorshipChairs";
  }

  if (value.includes("web") || value === "web-ch") {
    return "webChairs";
  }

  if (
    value.includes("publicity") ||
    value.includes("communication") ||
    value.includes("comm chair") ||
    value === "pub-comm-ch"
  ) {
    return "publicityChairs";
  }

  if (value.includes("registration") || value === "reg-ch") {
    return "registrationChairs";
  }

  if (
    (value.includes("publication") && !value.includes("publicity")) ||
    value === "publ-ch"
  ) {
    return "publicationChairs";
  }

  if (
    value.includes("speaker") ||
    value.includes("session chair") ||
    value === "spk-ch"
  ) {
    return "speakersSessionChairs";
  }

  if (
    value.includes("junior") ||
    value === "org-jr" ||
    value === "juniors" ||
    value.includes("jeune") ||
    value.includes("junior organizing")
  ) {
    return "organizingJuniors";
  }

  if (
    value.includes("scientific") ||
    value.includes("scientifique") ||
    value === "sci" ||
    value.includes("program committee") ||
    value.includes("comite scientifique") ||
    value.includes("comité scientifique")
  ) {
    return "scientific";
  }

  if (
    value.includes("senior") ||
    value.includes("organizing local") ||
    value.includes("organizing committee") ||
    value.includes("organising") ||
    value.includes("organizing") ||
    value.includes("comite organisateur") ||
    value.includes("comité organisateur") ||
    value.includes("local committee") ||
    value === "org-sr" ||
    value === "organizing" ||
    value === "organising" ||
    value === "org" ||
    value === "olc"
  ) {
    return "organizingSenior";
  }

  return null;
}

function rowToMember(row, prefix, index) {
  const name = pickValue(row, NAME_KEYS);
  if (!name) return null;

  return {
    ...emptyMember(prefix),
    id: `${prefix}-import-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 6)}`,
    name,
    affiliation: pickValue(row, AFFILIATION_KEYS),
    email: pickValue(row, EMAIL_KEYS),
    enabled: true,
  };
}

function emptyResult() {
  const result = { mode: "tab", totalRows: 0, skippedRows: 0, warnings: [] };
  for (const id of COMMITTEE_GROUP_IDS) {
    result[id] = [];
  }
  return result;
}

function countMembers(result) {
  return COMMITTEE_GROUP_IDS.reduce((sum, id) => sum + (result[id]?.length ?? 0), 0);
}

function sheetHasCommitteeColumn(rows) {
  if (!rows.length) return false;
  return rowHasAnyKey(mapRow(rows[0]), COMMITTEE_KEYS);
}

function sheetHasNameColumn(rows) {
  if (!rows.length) return false;
  return rowHasAnyKey(mapRow(rows[0]), NAME_KEYS);
}

/** Skip title rows and detect the real header row. */
function sheetToRows(sheet) {
  const readFromRow = (startRow) => {
    const ref = sheet["!ref"];
    if (!ref) return [];
    const range = XLSX.utils.decode_range(ref);
    range.s.r = startRow;
    return XLSX.utils.sheet_to_json(sheet, {
      defval: "",
      range: XLSX.utils.encode_range(range),
    });
  };

  let rows = readFromRow(0);
  if (rows.length === 0) return rows;

  if (!sheetHasNameColumn(rows)) {
    for (let start = 1; start <= 4 && start < 8; start += 1) {
      const candidate = readFromRow(start);
      if (candidate.length > 0 && sheetHasNameColumn(candidate)) {
        rows = candidate;
        break;
      }
    }
  }

  return rows;
}

function addMember(result, committeeKey, row, report) {
  const prefix = TAB_PREFIX[committeeKey];
  const member = rowToMember(row, prefix, result[committeeKey].length);
  if (member) {
    result[committeeKey].push(member);
    return true;
  }

  report.skippedRows += 1;
  const label = pickValue(row, NAME_KEYS) || pickValue(row, AFFILIATION_KEYS) || "blank row";
  if (report.skippedRows <= 5) {
    report.warnings.push(`Skipped row with no name: "${label.slice(0, 60)}"`);
  }
  return false;
}

function parseRowsIntoResult(rows, result, report, { sheetKey, activeTab, activePrefix }) {
  if (!rows.length) return;

  const mappedRows = rows.map(mapRow);
  const hasCommitteeColumn = sheetHasCommitteeColumn(rows);
  const defaultKey = sheetKey ?? activeTab ?? null;

  for (const row of mappedRows) {
    let committeeKey = resolveCommitteeType(pickValue(row, COMMITTEE_KEYS));

    if (!committeeKey && hasCommitteeColumn && defaultKey) {
      committeeKey = defaultKey;
    }

    if (!committeeKey && !hasCommitteeColumn && defaultKey) {
      committeeKey = defaultKey;
    }

    if (!committeeKey) {
      report.skippedRows += 1;
      const hint = pickValue(row, NAME_KEYS) || pickValue(row, COMMITTEE_KEYS);
      if (hint && report.warnings.length < 8) {
        report.warnings.push(
          `Could not assign committee for "${hint.slice(0, 40)}". Use Senior, Juniors, or Scientific.`
        );
      }
      continue;
    }

    addMember(result, committeeKey, row, report);
  }
}

export function isSpreadsheetFile(file) {
  if (!file?.name) return false;
  return /\.(xlsx|xls|csv)$/i.test(file.name);
}

function finalizeResult(result, report) {
  result.totalRows = countMembers(result);
  result.skippedRows = report.skippedRows;
  result.warnings = report.warnings;
  if (report.skippedRows > 5) {
    result.warnings.push(`…and ${report.skippedRows - 5} more row(s) skipped (missing name or committee).`);
  }
  return result;
}

/** Parse an Excel/CSV file into committee member lists. */
export async function parseCommitteeExcelFile(file, { activeTab, activePrefix } = {}) {
  if (!file) throw new Error("No file selected.");
  if (!isSpreadsheetFile(file)) {
    throw new Error("Please upload an Excel (.xlsx, .xls) or CSV file.");
  }

  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const result = emptyResult();
  const report = { skippedRows: 0, warnings: [] };

  if (workbook.SheetNames.length === 0) {
    throw new Error("The spreadsheet has no sheets.");
  }

  for (const sheetName of workbook.SheetNames) {
    const rows = sheetToRows(workbook.Sheets[sheetName]);
    if (!rows.length) continue;

    const sheetKey = resolveCommitteeType(sheetName);
    parseRowsIntoResult(rows, result, report, {
      sheetKey,
      activeTab,
      activePrefix,
    });
  }

  if (countMembers(result) > 0) {
    const usedSheets = workbook.SheetNames.length > 1;
    const usedCommitteeColumn = workbook.SheetNames.some((name) =>
      sheetHasCommitteeColumn(sheetToRows(workbook.Sheets[name]))
    );
    result.mode =
      usedSheets || usedCommitteeColumn || countMembers(result) > result[activeTab]?.length
        ? "multi"
        : "tab";
    return finalizeResult(result, report);
  }

  throw new Error(
    "No valid rows found. Include a Name column (and Affiliation). " +
      "For organizing imports, use sheet names like Senior / Juniors / Organizing, " +
      "or a Committee column with those values."
  );
}

export function formatImportSummary(parsed, { activeLabel } = {}) {
  const parts = [];
  const labels = {
    honoraryChairs: "honorary",
    conferenceChair: "conference chair",
    conferenceCoChair: "co-chair",
    sponsorshipChairs: "sponsorship",
    webChairs: "web",
    publicityChairs: "publicity",
    registrationChairs: "registration",
    publicationChairs: "publication",
    speakersSessionChairs: "speakers session",
    organizingSenior: "senior",
    organizingJuniors: "junior",
    scientific: "scientific",
  };

  if (parsed.mode === "multi") {
    for (const [key, label] of Object.entries(labels)) {
      const count = parsed[key]?.length ?? 0;
      if (count) parts.push(`${count} ${label}`);
    }
    const breakdown = parts.length ? parts.join(", ") : `${parsed.totalRows} members`;
    let message = `Imported ${breakdown}. Save to publish.`;
    if (parsed.skippedRows > 0) {
      message += ` ${parsed.skippedRows} row(s) were skipped.`;
    }
    return { message, warnings: parsed.warnings ?? [] };
  }

  let message = `Imported ${parsed.totalRows} member${parsed.totalRows === 1 ? "" : "s"} into ${activeLabel ?? "this committee"}. Save to publish.`;
  if (parsed.skippedRows > 0) {
    message += ` ${parsed.skippedRows} row(s) were skipped (missing name or unrecognized committee).`;
  }
  return { message, warnings: parsed.warnings ?? [] };
}

export function downloadCommitteeTemplate(mode = "tab") {
  let rows;
  if (mode === "multi") {
    rows = [
      { Committee: "Honorary", Name: "Prof. Jane Doe", Affiliation: "University, City, Country", Email: "" },
      { Committee: "Conference Chair", Name: "Prof. John Smith", Affiliation: "University, City, Country", Email: "chair@university.edu" },
      { Committee: "Senior", Name: "Prof. Jane Doe", Affiliation: "University, City, Country", Email: "name@university.edu" },
      { Committee: "Juniors", Name: "John Smith", Affiliation: "University, City, Country", Email: "" },
      { Committee: "Scientific", Name: "Prof. Alan Turing", Affiliation: "University, City, Country", Email: "" },
    ];
  } else {
    rows = [
      {
        Name: "Prof. Jane Doe",
        Affiliation: "University, City, Country",
        Email: "name@university.edu",
      },
      {
        Name: "John Smith",
        Affiliation: "University, City, Country",
        Email: "",
      },
    ];
  }

  const sheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, "All committees");
  XLSX.writeFile(workbook, "committee-import-template.xlsx");
}
