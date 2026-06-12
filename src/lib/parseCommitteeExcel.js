import * as XLSX from "xlsx";
import { emptyMember } from "./committees";

const TAB_PREFIX = {
  organizingSenior: "org-sr",
  organizingJuniors: "org-jr",
  scientific: "sci",
};

const NAME_KEYS = ["name", "full name", "member", "nom", "nom complet"];
const AFFILIATION_KEYS = [
  "affiliation",
  "institution",
  "organization",
  "organisation",
  "university",
];
const EMAIL_KEYS = ["email", "e-mail", "mail"];
const COMMITTEE_KEYS = ["committee", "type", "section", "comite", "category"];

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

function resolveCommitteeType(raw) {
  const value = String(raw ?? "")
    .trim()
    .toLowerCase();

  if (!value) return null;
  if (value.includes("junior") || value === "org-jr" || value === "juniors") {
    return "organizingJuniors";
  }
  if (
    value.includes("senior") ||
    value.includes("organizing local") ||
    value === "org-sr" ||
    value === "senior organizing"
  ) {
    return "organizingSenior";
  }
  if (value.includes("scientific") || value === "sci") {
    return "scientific";
  }
  return null;
}

function sheetNameToCommittee(sheetName) {
  return resolveCommitteeType(sheetName);
}

function rowToMember(row, prefix, index) {
  const name = pickValue(row, NAME_KEYS);
  if (!name) return null;

  return {
    ...emptyMember(prefix),
    id: `${prefix}-import-${Date.now()}-${index}`,
    name,
    affiliation: pickValue(row, AFFILIATION_KEYS),
    email: pickValue(row, EMAIL_KEYS),
    enabled: true,
  };
}

function sheetToRows(sheet) {
  return XLSX.utils.sheet_to_json(sheet, { defval: "" });
}

function emptyResult() {
  return {
    organizingSenior: [],
    organizingJuniors: [],
    scientific: [],
    mode: "tab",
    totalRows: 0,
  };
}

function countMembers(result) {
  return (
    result.organizingSenior.length +
    result.organizingJuniors.length +
    result.scientific.length
  );
}

function parseSheetRows(rows, prefix, targetKey, result) {
  const mappedRows = rows.map(mapRow);
  for (const row of mappedRows) {
    const member = rowToMember(row, prefix, result[targetKey].length);
    if (member) result[targetKey].push(member);
  }
}

function parseSheetWithCommitteeColumn(rows, result) {
  const mappedRows = rows.map(mapRow);
  for (const row of mappedRows) {
    const committeeKey = resolveCommitteeType(pickValue(row, COMMITTEE_KEYS));
    if (!committeeKey) continue;
    const member = rowToMember(row, TAB_PREFIX[committeeKey], result[committeeKey].length);
    if (member) result[committeeKey].push(member);
  }
}

export function isSpreadsheetFile(file) {
  if (!file?.name) return false;
  return /\.(xlsx|xls|csv)$/i.test(file.name);
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

  if (workbook.SheetNames.length > 1) {
    for (const sheetName of workbook.SheetNames) {
      const committeeKey = sheetNameToCommittee(sheetName);
      if (!committeeKey) continue;
      const rows = sheetToRows(workbook.Sheets[sheetName]);
      parseSheetRows(rows, TAB_PREFIX[committeeKey], committeeKey, result);
    }
    if (countMembers(result) > 0) {
      result.mode = "multi";
      result.totalRows = countMembers(result);
      return result;
    }
  }

  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = sheetToRows(sheet);
  if (rows.length === 0) {
    throw new Error("The spreadsheet is empty.");
  }

  const mappedRows = rows.map(mapRow);
  const hasCommitteeColumn = mappedRows.some((row) => pickValue(row, COMMITTEE_KEYS));

  if (hasCommitteeColumn) {
    parseSheetWithCommitteeColumn(rows, result);
    if (countMembers(result) === 0) {
      throw new Error(
        "No valid rows found. Use committee values: Senior, Juniors, or Scientific."
      );
    }
    result.mode = "multi";
    result.totalRows = countMembers(result);
    return result;
  }

  if (!activeTab || !activePrefix) {
    throw new Error(
      "Use columns Name and Affiliation, or add a Committee column (Senior / Juniors / Scientific)."
    );
  }

  parseSheetRows(rows, activePrefix, activeTab, result);
  if (result[activeTab].length === 0) {
    throw new Error("No valid rows found. Include at least a Name column.");
  }

  result.mode = "tab";
  result.totalRows = result[activeTab].length;
  return result;
}

export function downloadCommitteeTemplate(mode = "tab") {
  let rows;
  if (mode === "multi") {
    rows = [
      {
        Committee: "Senior",
        Name: "Prof. Jane Doe",
        Affiliation: "University, City, Country",
        Email: "name@university.edu",
      },
      {
        Committee: "Juniors",
        Name: "John Smith",
        Affiliation: "University, City, Country",
        Email: "",
      },
      {
        Committee: "Scientific",
        Name: "Prof. Alan Turing",
        Affiliation: "University, City, Country",
        Email: "",
      },
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
  XLSX.utils.book_append_sheet(workbook, sheet, "Committees");
  XLSX.writeFile(workbook, "committee-import-template.xlsx");
}
