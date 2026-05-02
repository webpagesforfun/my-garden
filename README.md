# 🌿 Garden Life Cycle Planner

A bilingual (PT/EN) garden care website for Central-West Portugal, litoral.
Live weather from Open-Meteo · Moon phase · Content editable via Google Sheets.

---

## 🚀 Deploy in 5 steps

### 1 — Push to GitHub

1. Create a free account at [github.com](https://github.com)
2. Create a new repository (e.g. `my-garden`)
3. Upload all these files, or use Git:
   ```
   git init
   git add .
   git commit -m "first commit"
   git remote add origin https://github.com/YOUR_USERNAME/my-garden.git
   git push -u origin main
   ```

### 2 — Deploy to Netlify

1. Create a free account at [netlify.com](https://netlify.com)
2. Click **Add new site → Import an existing project**
3. Connect to GitHub and select your repository
4. Leave all build settings empty (no build command needed)
5. Click **Deploy site**
6. Your site is live at a URL like `https://quirky-name-123.netlify.app`
7. Optional: set a custom domain in **Site settings → Domain management**

---

## 📊 Connect Google Sheets (to edit content without touching code)

### Step 1 — Create your sheet

1. Go to [sheets.google.com](https://sheets.google.com) and create a new spreadsheet
2. Import the template: **File → Import → Upload** and select `sheets-template.csv`
3. Your sheet will have these columns:

| Column | Field | Description |
|--------|-------|-------------|
| A | `species_id` | Unique ID, no spaces (e.g. `freesia`) |
| B | `name_pt` | Species name in Portuguese |
| C | `name_en` | Species name in English |
| D | `latin` | Latin name |
| E | `icon` | Emoji (e.g. 🌸) |
| F | `pills_pt` | Comma-separated tags in Portuguese |
| G | `pills_en` | Comma-separated tags in English |
| H | `facts_pt` | Short description in Portuguese |
| I | `facts_en` | Short description in English |
| J | `month` | Month number (1 = January … 12 = December) |
| K | `phase` | One of: `plant` `grow` `bloom` `tend` `lift` `rest` |
| L | `task_pt` | Task description in Portuguese |
| M | `task_en` | Task description in English |

> **One row = one task.** Repeat species_id and month for multiple tasks in the same month.
> You only need to fill columns B–I on the **first row** of each species — leave them blank on repeat rows.

### Step 2 — Publish the sheet

1. Click **File → Share → Publish to web**
2. Under "Link", choose the sheet tab (e.g. "Sheet1") and format **CSV**
3. Click **Publish** and copy the URL

The URL looks like:
```
https://docs.google.com/spreadsheets/d/SHEET_ID/pub?gid=0&single=true&output=csv
```

### Step 3 — Paste the URL into the app

Open `src/utils/sheets.js` and replace the empty string:

```js
const CONFIG = {
  SHEET_CSV_URL: "https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/pub?...",
  ...
};
```

Commit and push — Netlify will redeploy automatically within seconds.

### Adding a new species

Add rows to the sheet with a new `species_id`. The app will pick it up automatically on next load.

### Editing a task

Simply edit the cell in Google Sheets. No code changes needed.

---

## 🌤 Weather

Weather data is fetched automatically from [Open-Meteo](https://open-meteo.com/) for Aveiro, Portugal.
- No API key required
- Updates on every page load
- Shows: temperature, precipitation, wind speed, UV index

To change the location, edit the coordinates in `src/utils/weather.js`:
```js
"?latitude=40.6405&longitude=-8.6538"
```

---

## 🌙 Moon phase

Calculated astronomically using the known lunar synodic cycle (29.53 days).
- No API required — works offline
- Clicking the widget opens tabuademares.com for full lunar data
- Updates on every page load

---

## 📁 Project structure

```
garden-app/
├── index.html              ← Main page
├── netlify.toml            ← Netlify config
├── sheets-template.csv     ← Google Sheets template to import
├── README.md               ← This file
└── src/
    ├── style.css           ← All styles
    ├── app.js              ← Main app logic
    ├── data/
    │   └── species.json    ← Local fallback data (used if no Sheet URL set)
    └── utils/
        ├── moon.js         ← Moon phase calculator
        ├── weather.js      ← Open-Meteo weather fetcher
        └── sheets.js       ← Google Sheets CSV loader
```

---

## 🛠 Local development

No build tools needed. Just serve the folder with any local server:

```bash
# Python
python3 -m http.server 8080

# Node.js (npx)
npx serve .

# VS Code
Install the "Live Server" extension and click "Go Live"
```

Then open `http://localhost:8080` in your browser.

> ⚠️ You must use a local server (not open `index.html` directly) because the app fetches local JSON files, which browsers block on `file://` URLs.

---

## ✏️ Customisation

| What | Where |
|------|-------|
| Add / edit species | Google Sheet (or `src/data/species.json` as fallback) |
| Change colours | CSS variables at top of `src/style.css` |
| Change location (weather) | Coordinates in `src/utils/weather.js` |
| Add a language | Add a new key to `UI` in `src/app.js` and `MOON_NAMES` in `src/utils/moon.js` |
| Change fonts | `<link>` in `index.html` + `font-family` in `src/style.css` |
