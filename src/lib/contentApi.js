import * as defaults from "../data/defaults";
import { isPersistedId } from "./ids";
import { supabase, isSupabaseConfigured } from "./supabase";
import {
  mapSpeaker,
  mapTopic,
  mapImportantDate,
  mapWorkshop,
  mapSponsor,
  mapQuickLink,
  speakerToRow,
  topicToRow,
  dateToRow,
  workshopToRow,
  sponsorToRow,
  quickLinkToRow,
} from "./mappers";

const TABLE_DEFAULTS = {
  speakers: {
    getItems: () => defaults.speakers,
    toRow: speakerToRow,
    matchKey: (item) => item.name,
  },
  topics: {
    getItems: () => defaults.topics,
    toRow: topicToRow,
    matchKey: (item) => item.name,
  },
  important_dates: {
    getItems: () => defaults.participationSteps,
    toRow: dateToRow,
    matchKey: (item) => item.title,
  },
  workshops: {
    getItems: () => defaults.workshops,
    toRow: workshopToRow,
    matchKey: (item) => item.title,
  },
  sponsors: {
    getItems: () => defaults.partners,
    toRow: sponsorToRow,
    matchKey: (item) => item.name,
  },
  quick_links: {
    getItems: () => defaults.quickLinks,
    toRow: quickLinkToRow,
    matchKey: (item) => item.title,
  },
};

const TABLES = {
  speakers: "speakers",
  topics: "topics",
  important_dates: "important_dates",
  workshops: "workshops",
  sponsors: "sponsors",
  quick_links: "quick_links",
};

const MAPPERS = {
  speakers: mapSpeaker,
  topics: mapTopic,
  important_dates: mapImportantDate,
  workshops: mapWorkshop,
  sponsors: mapSponsor,
  quick_links: mapQuickLink,
};

/** Stable ordering so duplicate seed rows always resolve to the same canonical id. */
function sortRowsByOrderAndId(rows) {
  return [...rows].sort((a, b) => {
    const orderDiff = (a.sort_order ?? 0) - (b.sort_order ?? 0);
    if (orderDiff !== 0) return orderDiff;
    return String(a.id).localeCompare(String(b.id));
  });
}

function rowMatchKey(table, row) {
  const config = TABLE_DEFAULTS[table];
  if (!config) return String(row.id);
  return config.matchKey(MAPPERS[table](row));
}

/** Keep one row per match key (title/name), prefer lowest sort_order then id. */
function dedupeRawRows(rows, table) {
  const config = TABLE_DEFAULTS[table];
  if (!config) return rows ?? [];

  const seen = new Set();
  const unique = [];
  for (const row of sortRowsByOrderAndId(rows ?? [])) {
    const key = rowMatchKey(table, row);
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(row);
  }
  return unique;
}

async function fetchTable(table) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from(table)
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return sortRowsByOrderAndId(data ?? []).map(MAPPERS[table]);
}

async function fetchSettings() {
  if (!supabase) return {};
  const { data, error } = await supabase.from("site_settings").select("key, value");
  if (error) throw error;
  return Object.fromEntries((data ?? []).map((r) => [r.key, r.value]));
}

const LIST_TABLES = Object.keys(TABLE_DEFAULTS);

/** Write default rows only when a list table is completely empty. */
async function ensureListTablesSeeded() {
  if (!supabase) return;

  await Promise.all(
    LIST_TABLES.map(async (table) => {
      const { count, error } = await supabase
        .from(table)
        .select("*", { count: "exact", head: true });
      if (error) throw error;
      if ((count ?? 0) === 0) await importDefaultsForTable(table);
    })
  );
}

export async function fetchAllContent() {
  if (!isSupabaseConfigured) return null;

  await ensureListTablesSeeded();

  const [speakers, topics, important_dates, workshops, sponsors, quick_links, settings] =
    await Promise.all([
      fetchTable("speakers"),
      fetchTable("topics"),
      fetchTable("important_dates"),
      fetchTable("workshops"),
      fetchTable("sponsors"),
      fetchTable("quick_links"),
      fetchSettings(),
    ]);

  return {
    speakers,
    topics,
    participationSteps: important_dates,
    workshops,
    partners: sponsors,
    quickLinks: quick_links,
    conference: settings.conference ?? null,
    callForPapers: settings.call_for_papers ?? null,
    submissionGuidelines: settings.submission_guidelines ?? null,
    registrationPricing: settings.registration_pricing ?? null,
    committees: settings.committees ?? null,
    sectionSettings: settings.section_settings ?? null,
    heroImages: settings.hero_images ?? null,
    heroHighlights: settings.hero_highlights ?? null,
    heroSponsors: settings.hero_sponsors ?? null,
    heroContent: settings.hero_content ?? null,
    navLinks: settings.nav_links ?? null,
    footer: settings.footer ?? null,
    footerLinks: settings.footer_links ?? null,
    previousEditions: settings.previous_editions ?? null,
  };
}

export async function upsertSetting(key, value) {
  if (!supabase) throw new Error("Supabase is not configured");
  const { error } = await supabase
    .from("site_settings")
    .upsert({ key, value }, { onConflict: "key" });
  if (error) throw error;
}

/** Insert any default items missing from the database (by name/title). */
export async function importDefaultsForTable(table) {
  if (!supabase) throw new Error("Supabase is not configured");

  const config = TABLE_DEFAULTS[table];
  if (!config) return;

  const { data: existing, error: fetchError } = await supabase
    .from(table)
    .select("*")
    .order("sort_order", { ascending: true });
  if (fetchError) throw fetchError;

  const existingKeys = new Set(
    dedupeRawRows(existing ?? [], table).map((row) => rowMatchKey(table, row))
  );
  const defaultItems = config.getItems();

  const rowsToInsert = defaultItems
    .map((item, index) => ({ item, row: config.toRow(item, index) }))
    .filter(({ item }) => !existingKeys.has(config.matchKey(item)))
    .map(({ row }) => row);

  if (rowsToInsert.length === 0) return;

  const { error: insertError } = await supabase.from(table).insert(rowsToInsert);
  if (insertError) throw insertError;
}

/** Look up a Supabase row id without inserting defaults. */
export async function lookupPersistedId(table, localItem) {
  if (!supabase) throw new Error("Supabase is not configured");
  if (localItem?.id && isPersistedId(localItem.id)) return localItem.id;

  const config = TABLE_DEFAULTS[table];
  const { data, error } = await supabase
    .from(table)
    .select("id, sort_order, name, title")
    .order("sort_order", { ascending: true });
  if (error) throw error;

  const sorted = sortRowsByOrderAndId(data ?? []);

  if (typeof localItem?.id === "number") {
    const byOrder = sorted.find((row) => row.sort_order === localItem.id - 1);
    if (byOrder) return byOrder.id;
  }

  if (config && localItem) {
    const key = config.matchKey(localItem);
    const byKey = sorted.find((row) => row.name === key || row.title === key);
    if (byKey) return byKey.id;
  }

  return null;
}

/** Map a local sample item (numeric id) to its Supabase UUID after defaults are synced. */
export async function resolvePersistedId(table, localItem) {
  if (localItem?.id && isPersistedId(localItem.id)) return localItem.id;

  await importDefaultsForTable(table);
  return lookupPersistedId(table, localItem);
}

export async function createRow(table, row) {
  if (!supabase) throw new Error("Supabase is not configured");
  const { data, error } = await supabase.from(table).insert(row).select().single();
  if (error) throw error;
  return MAPPERS[table](data);
}

export async function updateRow(table, id, row) {
  if (!supabase) throw new Error("Supabase is not configured");
  const { data, error } = await supabase
    .from(table)
    .update(row)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return MAPPERS[table](data);
}

export async function deleteRow(table, id) {
  if (!supabase) throw new Error("Supabase is not configured");
  const { error } = await supabase.from(table).delete().eq("id", id);
  if (error) throw error;
}

/** Persist a new sort order for list rows (speakers, topics, etc.). */
export async function reorderRows(table, orderedIds) {
  if (!supabase) throw new Error("Supabase is not configured");

  const updates = orderedIds
    .map((id, sort_order) => ({ id, sort_order }))
    .filter(({ id }) => isPersistedId(id));

  const results = await Promise.all(
    updates.map(({ id, sort_order }) =>
      supabase.from(table).update({ sort_order }).eq("id", id)
    )
  );

  const failed = results.find((r) => r.error);
  if (failed?.error) throw failed.error;
}

export { TABLES };
