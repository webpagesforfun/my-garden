/**
 * sheets.js — Loads garden data from a published Google Sheet.
 *
 * HOW TO SET UP YOUR GOOGLE SHEET:
 * ─────────────────────────────────────────────────────────────────
 * 1. Make a copy of the template sheet (link in README.md)
 * 2. File → Share → Publish to web → choose "CSV" → Publish
 * 3. Copy the URL and paste it into CONFIG below (SHEET_CSV_URL)
 * ─────────────────────────────────────────────────────────────────
 *
 * SHEET COLUMN FORMAT (row 1 = headers, data from row 2):
 *   A: species_id      — e.g. "freesia"  (no spaces, lowercase)
 *   B: name_pt         — e.g. "Frésia"
 *   C: name_en         — e.g. "Freesia"
 *   D: latin           — e.g. "Freesia spp."
 *   E: icon            — e.g. 🌸
 *   F: pills_pt        — comma-separated, e.g. "Bolbo,Sol pleno"
 *   G: pills_en        — comma-separated, e.g. "Bulb,Full sun"
 *   H: facts_pt        — short paragraph in Portuguese
 *   I: facts_en        — short paragraph in English
 *   J: month           — 1–12
 *   K: phase           — plant | grow | bloom | tend | lift | rest
 *   L: task_pt         — one task per row (multiple rows per month)
 *   M: task_en         — English version of the same task
 */

const CONFIG = {
  // ⬇️  PASTE YOUR PUBLISHED GOOGLE SHEET CSV URL HERE
  SHEET_CSV_URL: "https://docs.google.com/spreadsheets/d/e/2PACX-1vSaQGMR87-dm1kyDQN59u7J0YGc1VErhKzS7tHqFr3uPw2DzwUYtwGWQJ0shlqoIjloISzgZCQMb5e0/pub?gid=756469245&single=true&output=csv",

  // Fallback: use local JSON data if sheet URL is not set
  USE_LOCAL_FALLBACK: true,
  LOCAL_DATA_URL: "src/data/species.json",
};

/**
 * Parse CSV text into array of row objects keyed by header name.
 */
function parseCsv(text) {
  const lines = text.trim().split("\n");
  const headers = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g, ""));
  return lines.slice(1).map(line => {
    // Handle quoted fields containing commas
    const fields = [];
    let current = "";
    let inQuotes = false;
    for (const ch of line) {
      if (ch === '"') { inQuotes = !inQuotes; }
      else if (ch === "," && !inQuotes) { fields.push(current.trim()); current = ""; }
      else { current += ch; }
    }
    fields.push(current.trim());
    const row = {};
    headers.forEach((h, i) => { row[h] = (fields[i] || "").replace(/^"|"$/g, ""); });
    return row;
  }).filter(r => r.species_id);
}

/**
 * Transform flat CSV rows into the nested species structure the app expects.
 */
function transformRows(rows) {
  const speciesMap = {};

  rows.forEach(row => {
    const id = row.species_id;
    if (!speciesMap[id]) {
      speciesMap[id] = {
        id,
        name:     { pt: row.name_pt,    en: row.name_en },
        latin:    row.latin,
        icon:     row.icon || "🌿",
        pills:    { pt: row.pills_pt.split(",").map(s => s.trim()),
                    en: row.pills_en.split(",").map(s => s.trim()) },
        facts:    { pt: row.facts_pt,    en: row.facts_en },
        lifecycle: {},
        tasks: {},
      };
    }

    const sp    = speciesMap[id];
    const month = parseInt(row.month) - 1; // 0-indexed
    const phase = row.phase;

    // Build lifecycle map
    if (!sp.lifecycle[phase]) sp.lifecycle[phase] = [];
    if (!sp.lifecycle[phase].includes(month)) sp.lifecycle[phase].push(month);

    // Build tasks map
    if (row.task_pt && row.task_en) {
      if (!sp.tasks[month]) sp.tasks[month] = {};
      if (!sp.tasks[month][phase]) sp.tasks[month][phase] = { pt: [], en: [] };
      sp.tasks[month][phase].pt.push(row.task_pt);
      sp.tasks[month][phase].en.push(row.task_en);
    }
  });

  return Object.values(speciesMap);
}

/**
 * Main loader — tries Sheet first, falls back to local JSON.
 */
async function loadSpeciesData() {
  // Try Google Sheet if URL is configured
  if (CONFIG.SHEET_CSV_URL) {
    try {
      const res = await fetch(CONFIG.SHEET_CSV_URL);
      if (!res.ok) throw new Error(`Sheet fetch failed: ${res.status}`);
      const text = await res.text();
      const rows = parseCsv(text);
      if (rows.length === 0) throw new Error("Sheet returned no data");
      console.log(`✅ Loaded ${rows.length} rows from Google Sheet`);
      return transformRows(rows);
    } catch (e) {
      console.warn("⚠️  Google Sheet unavailable, falling back to local data:", e.message);
    }
  }

  // Fallback to local JSON
  if (CONFIG.USE_LOCAL_FALLBACK) {
    const res  = await fetch(CONFIG.LOCAL_DATA_URL);
    if (!res.ok) throw new Error("Local species data not found");
    const data = await res.json();
    console.log("📦 Loaded species data from local JSON");
    return data;
  }

  throw new Error("No data source configured. Set SHEET_CSV_URL in sheets.js");
}
