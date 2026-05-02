/**
 * app.js — Main application controller
 * Wires together: data loading, UI rendering, language switching
 */

/* ── STATE ────────────────────────────────────────── */
let LANG    = "pt";
let SPECIES = [];
let LOADED  = false;

/* ── UI STRINGS ───────────────────────────────────── */
const UI = {
  pt: {
    eyebrow:       "Guia do jardim · Portugal Centro-Oeste, Litoral",
    title:         "Ciclo de Vida<br><em>do Jardim</em>",
    sub:           "Cuidados anuais por espécie · Selecione uma espécie para explorar",
    phaseCol:      "Fase",
    sectionCycle:  "Ciclo anual completo",
    sectionTasks:  "Tarefas mensais",
    noTasks:       "Sem tarefas este mês — a planta está em repouso ou transição natural.",
    factsLabel:    "Notas rápidas",
    loading:       "A carregar dados do jardim…",
    loadingNav:    "A carregar espécies…",
    errorTitle:    "Erro ao carregar dados",
    errorBody:     "Não foi possível carregar os dados das espécies. Verifique a sua ligação ou a configuração da folha de cálculo.",
    errorLink:     "Ver instruções de configuração",
    phases: {
      plant: "Plantar / semear",
      grow:  "Crescimento",
      bloom: "Floração",
      tend:  "Manutenção",
      lift:  "Arrancar / guardar",
      rest:  "Repouso",
    },
    months: ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"],
  },
  en: {
    eyebrow:       "Garden planner · Central-West Portugal, Litoral",
    title:         "Life Cycle<br><em>Garden Guide</em>",
    sub:           "Full-year care structured by species lifecycle · Select a species to explore",
    phaseCol:      "Phase",
    sectionCycle:  "Full-year life cycle",
    sectionTasks:  "Monthly task detail",
    noTasks:       "No tasks needed this month — the plant is resting or transitioning naturally.",
    factsLabel:    "Quick facts",
    loading:       "Loading garden data…",
    loadingNav:    "Loading species…",
    errorTitle:    "Could not load data",
    errorBody:     "Species data could not be loaded. Check your connection or spreadsheet configuration.",
    errorLink:     "View setup instructions",
    phases: {
      plant: "Plant / sow",
      grow:  "Grow",
      bloom: "Bloom",
      tend:  "Tend",
      lift:  "Lift / store",
      rest:  "Rest",
    },
    months: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
  },
};

/* ── PHASE STYLES ─────────────────────────────────── */
const PH = {
  plant: { bar: "#3a7a5e", bg: "var(--ph-plant-bg)", color: "var(--ph-plant)" },
  grow:  { bar: "#5a7a2e", bg: "var(--ph-grow-bg)",  color: "var(--ph-grow)"  },
  bloom: { bar: "#a06820", bg: "var(--ph-bloom-bg)", color: "var(--ph-bloom)" },
  tend:  { bar: "#6a4a8a", bg: "var(--ph-tend-bg)",  color: "var(--ph-tend)"  },
  lift:  { bar: "#8a3a2e", bg: "var(--ph-lift-bg)",  color: "var(--ph-lift)"  },
  rest:  { bar: "#7a7870", bg: "var(--ph-rest-bg)",  color: "var(--ph-rest)"  },
};

const NOW_M = new Date().getMonth();

/* ── HELPERS ──────────────────────────────────────── */
function u()   { return UI[LANG] || UI.pt; }
function ph(k) { return PH[k]    || PH.rest; }
function t(obj) {
  if (!obj) return "";
  if (typeof obj === "string") return obj;
  return obj[LANG] || obj.en || "";
}

function phaseOf(sp, m) {
  for (const [phase, months] of Object.entries(sp.lifecycle)) {
    if (Array.isArray(months) && months.includes(m)) return phase;
  }
  return "rest";
}

/* ── MASTHEAD ─────────────────────────────────────── */
function updateMasthead() {
  const ui = u();
  document.getElementById("hd-eyebrow").textContent = ui.eyebrow;
  document.getElementById("hd-title").innerHTML     = ui.title;
  document.getElementById("hd-sub").textContent     = ui.sub;
  document.documentElement.lang = LANG;
  document.title = LANG === "pt"
    ? "Guia do Jardim · Portugal Centro-Oeste"
    : "Garden Life Cycle Planner · Central-West Portugal";
}

/* ── SPECIES NAV ──────────────────────────────────── */
function buildNav() {
  const nav = document.getElementById("speciesNav");
  nav.innerHTML = "";
  SPECIES.forEach((sp, i) => {
    const btn = document.createElement("button");
    btn.className  = "snav-btn" + (i === 0 ? " active" : "");
    btn.innerHTML  = `<span class="snav-icon">${sp.icon}</span>${t(sp.name)}`;
    btn.dataset.id = sp.id;
    btn.onclick    = () => activateSpecies(sp.id);
    nav.appendChild(btn);
  });
}

function activateSpecies(id) {
  document.querySelectorAll(".snav-btn").forEach(b =>
    b.classList.toggle("active", b.dataset.id === id)
  );
  document.querySelectorAll(".species-section").forEach(s =>
    s.classList.toggle("active", s.id === "sp-" + id)
  );
}

/* ── TIMELINE ─────────────────────────────────────── */
function buildTimeline(sp) {
  const ui          = u();
  const usedPhases  = Object.keys(sp.lifecycle).filter(p => sp.lifecycle[p].length > 0);
  const months      = ui.months;

  let html = `<div class="timeline-wrap"><table class="timeline-table">
    <thead><tr class="tbl-head-row">
      <th>${ui.phaseCol}</th>`;
  months.forEach((m, i) => {
    html += `<th class="${i === NOW_M ? "today-col" : ""}">${m}</th>`;
  });
  html += `</tr></thead><tbody>`;

  usedPhases.forEach(phase => {
    const p     = ph(phase);
    const label = ui.phases[phase] || phase;
    html += `<tr class="tbl-row">
      <td><span class="tbl-phase-swatch" style="background:${p.bar}"></span>${label}</td>`;
    for (let m = 0; m < 12; m++) {
      const active = (sp.lifecycle[phase] || []).includes(m);
      html += `<td class="${m === NOW_M ? "today-col" : ""}">`;
      if (active) html += `<div class="phase-bar" style="background:${p.bar};opacity:0.85"></div>`;
      html += `</td>`;
    }
    html += `</tr>`;
  });

  html += `</tbody></table></div>`;
  return html;
}

/* ── MONTH STRIP ──────────────────────────────────── */
function buildStrip(sp) {
  const months = u().months;
  let html = `<div class="month-strip" id="strip-${sp.id}">`;
  months.forEach((m, i) => {
    const isNow = i === NOW_M;
    html += `<button class="m-btn${isNow ? " active" : ""} ${isNow ? "today-m" : ""}"
      data-m="${i}">${m}</button>`;
  });
  return html + `</div>`;
}

/* ── TASK CARDS ───────────────────────────────────── */
function renderTasks(sp, m) {
  const container = document.getElementById("tasks-" + sp.id);
  if (!container) return;
  container.innerHTML = "";
  const monthData = sp.tasks[m];
  const ui = u();

  if (!monthData || Object.keys(monthData).length === 0) {
    const phase = phaseOf(sp, m);
    const p     = ph(phase);
    const label = ui.phases[phase] || phase;
    container.innerHTML = `
      <div class="task-card">
        <div class="tc-head" style="background:${p.bg};color:${p.color}">
          <span class="tc-dot" style="background:${p.bar}"></span>${label}
        </div>
        <div class="tc-empty">${ui.noTasks}</div>
      </div>`;
    return;
  }

  Object.entries(monthData).forEach(([phase, phData]) => {
    const p     = ph(phase);
    const label = ui.phases[phase] || phase;
    // phData can be { pt: [...], en: [...] } (from sheet) or an array (legacy)
    const tasks = Array.isArray(phData) ? phData : (phData[LANG] || phData.pt || []);
    const items = tasks.map(task => `
      <div class="tc-task">
        <span class="tc-bullet" style="background:${p.bar}"></span>
        <span>${task}</span>
      </div>`).join("");
    container.innerHTML += `
      <div class="task-card">
        <div class="tc-head" style="background:${p.bg};color:${p.color}">
          <span class="tc-dot" style="background:${p.bar}"></span>${label}
        </div>
        <div class="tc-body">${items}</div>
      </div>`;
  });
}

/* ── SPECIES SECTION ──────────────────────────────── */
function buildSection(sp, first) {
  const ui       = u();
  const wrap     = document.createElement("div");
  wrap.className = "species-section" + (first ? " active" : "");
  wrap.id        = "sp-" + sp.id;

  const pillsHTML = t(sp.pills).map(p => `<span class="sp-pill">${p}</span>`).join("");

  wrap.innerHTML = `
    <div class="sp-header">
      <div>
        <h2 class="sp-name">${sp.icon} ${t(sp.name)}</h2>
        <div class="sp-latin">${sp.latin}</div>
        <div class="sp-pills">${pillsHTML}</div>
      </div>
      <div class="sp-facts">
        <strong>${ui.factsLabel}</strong>${t(sp.facts)}
      </div>
    </div>
    <p class="section-label">${ui.sectionCycle}</p>
    ${buildTimeline(sp)}
    <p class="section-label">${ui.sectionTasks}</p>
    ${buildStrip(sp)}
    <div class="task-grid" id="tasks-${sp.id}"></div>`;

  document.getElementById("pageWrap").appendChild(wrap);

  wrap.querySelector(`#strip-${sp.id}`).addEventListener("click", e => {
    const btn = e.target.closest(".m-btn");
    if (!btn) return;
    wrap.querySelectorAll(".m-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    renderTasks(sp, parseInt(btn.dataset.m));
  });

  renderTasks(sp, NOW_M);
}

/* ── FULL REBUILD (on language switch) ────────────── */
function rebuild() {
  const activeId = document.querySelector(".snav-btn.active")?.dataset.id
    || (SPECIES[0] && SPECIES[0].id);
  const activeM  = parseInt(
    document.querySelector(`#sp-${activeId} .m-btn.active`)?.dataset.m ?? NOW_M
  );

  document.getElementById("pageWrap").innerHTML = "";
  buildNav();
  SPECIES.forEach((sp, i) => buildSection(sp, i === 0));
  updateMasthead();

  if (activeId) activateSpecies(activeId);

  const mBtn = document.querySelector(`#sp-${activeId} .m-btn[data-m="${activeM}"]`);
  if (mBtn) {
    document.querySelectorAll(`#sp-${activeId} .m-btn`).forEach(b => b.classList.remove("active"));
    mBtn.classList.add("active");
    renderTasks(SPECIES.find(s => s.id === activeId), activeM);
  }
}

/* ── LANGUAGE SWITCH ──────────────────────────────── */
function setLang(lang) {
  LANG = lang;
  document.getElementById("btnPT").classList.toggle("active", lang === "pt");
  document.getElementById("btnEN").classList.toggle("active", lang === "en");
  renderMoonWidget(lang);
  updateWeatherLabels(lang);
  if (LOADED) rebuild();
}

/* ── INIT ─────────────────────────────────────────── */
async function init() {
  // Set PT as default immediately
  document.getElementById("btnPT").classList.add("active");
  document.getElementById("btnEN").classList.remove("active");
  updateMasthead();
  renderMoonWidget("pt");

  // Load weather in background
  initWeather("pt");

  // Load species data
  try {
    const loadingMsg = document.getElementById("loadingMsg");
    if (loadingMsg) loadingMsg.textContent = u().loading;

    SPECIES = await loadSpeciesData();
    LOADED  = true;

    document.getElementById("loadingState")?.remove();
    document.getElementById("snavLoading")?.remove();

    buildNav();
    SPECIES.forEach((sp, i) => buildSection(sp, i === 0));
  } catch (err) {
    console.error("Failed to load species data:", err);
    const ui = u();
    document.getElementById("loadingState").innerHTML = `
      <div class="error-state">
        <h3>${ui.errorTitle}</h3>
        <p>${ui.errorBody}</p>
        <p style="margin-top:12px">
          <a href="README.md" target="_blank">${ui.errorLink}</a>
        </p>
      </div>`;
    document.getElementById("snavLoading").textContent = ui.errorTitle;
  }
}

document.addEventListener("DOMContentLoaded", init);
