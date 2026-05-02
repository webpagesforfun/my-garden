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
    monthView:     "Este Mês",
    monthViewSub:  "Todas as tarefas para",
    noTasksMonth:  "Sem tarefas este mês.",
    progress:      "concluídas",
    clearDone:     "Limpar concluídas",
    resetAll:      "Repor todas",
    requestTab:    "Ver mais espécies",
    requestTitle:  "Sugira uma nova espécie",
    requestSub:    "Não encontrou a sua planta favorita? Sugira-a aqui e analisaremos a possibilidade de a incluir no guia.",
    requestName:   "Nome da espécie",
    requestNamePh: "Ex: Lavanda, Girassol, Begónia…",
    requestWhy:    "Porquê esta espécie?",
    requestWhyPh:  "Diga-nos porque seria uma boa adição ao guia (opcional)",
    requestEmail:  "O seu email (opcional)",
    requestEmailPh:"Para lhe respondermos quando for adicionada",
    requestSubmit: "Enviar sugestão",
    requestSending:"A enviar…",
    requestDone:   "Sugestão enviada, obrigado! 🌱",
    requestDoneSub:"Analisaremos o seu pedido em breve.",
    requestErr:    "Erro ao enviar. Por favor tente novamente.",
    requestAnother:"Enviar outra sugestão",
    requestConfig: "⚙️ Configure o Google Form para receber sugestões. Ver README.md para instruções.",
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
    monthView:     "This Month",
    monthViewSub:  "All tasks for",
    noTasksMonth:  "No tasks this month.",
    progress:      "completed",
    clearDone:     "Clear completed",
    resetAll:      "Reset all",
    requestTab:    "See more species",
    requestTitle:  "Suggest a new species",
    requestSub:    "Can't find your favourite plant? Suggest it here and we'll consider adding it to the guide.",
    requestName:   "Species name",
    requestNamePh: "E.g. Lavender, Sunflower, Begonia…",
    requestWhy:    "Why this species?",
    requestWhyPh:  "Tell us why it would be a great addition (optional)",
    requestEmail:  "Your email (optional)",
    requestEmailPh:"So we can let you know when it's added",
    requestSubmit: "Submit suggestion",
    requestSending:"Sending…",
    requestDone:   "Suggestion sent, thank you! 🌱",
    requestDoneSub:"We'll review your request soon.",
    requestErr:    "Error sending. Please try again.",
    requestAnother:"Send another suggestion",
    requestConfig: "⚙️ Configure the Google Form to receive suggestions. See README.md for instructions.",
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

/* ── GOOGLE FORM CONFIG ───────────────────────────── */
/**
 * HOW TO SET UP:
 * 1. Go to forms.google.com → create a new form
 * 2. Add three questions (Short answer):
 *    - "Species name"
 *    - "Why this species?"
 *    - "Email"
 * 3. Click the 3-dot menu → Get pre-filled link
 * 4. Fill dummy values, click Get Link, copy it
 * 5. From that URL extract the entry.XXXXXXX ids
 * 6. Paste your Form action URL and entry ids below
 * 7. In the form settings → Responses → link to your existing Sheet
 */
const FORM_CONFIG = {
  // ⬇️  PASTE YOUR GOOGLE FORM ACTION URL HERE (ends with /formResponse)
  ACTION_URL: "",
  FIELDS: {
    name:  "", // ⬇️  e.g. "entry.123456789"
    why:   "", // ⬇️  e.g. "entry.987654321"
    email: "", // ⬇️  e.g. "entry.111222333"
  },
};


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

/* ── SPECIES REQUEST SECTION ──────────────────────── */
function buildRequestSection() {
  const existing = document.getElementById("requestSection");
  if (existing) existing.remove();

  const ui   = u();
  const wrap = document.createElement("div");
  wrap.id    = "requestSection";
  wrap.className = "request-section";

  const configured = FORM_CONFIG.ACTION_URL && FORM_CONFIG.FIELDS.name;

  wrap.innerHTML = `
    <div class="req-inner">
      <div class="req-left">
        <div class="req-eyebrow">${ui.requestTab}</div>
        <h2 class="req-title">${ui.requestTitle}</h2>
        <p class="req-sub">${ui.requestSub}</p>
      </div>
      <div class="req-right">
        ${configured ? `
        <div class="req-form-wrap" id="reqFormWrap">
          <div class="req-field">
            <label class="req-label" for="reqName">${ui.requestName} <span class="req-required">*</span></label>
            <input class="req-input" id="reqName" type="text" placeholder="${ui.requestNamePh}" maxlength="120">
          </div>
          <div class="req-field">
            <label class="req-label" for="reqWhy">${ui.requestWhy}</label>
            <textarea class="req-input req-textarea" id="reqWhy" placeholder="${ui.requestWhyPh}" rows="3" maxlength="400"></textarea>
          </div>
          <div class="req-field">
            <label class="req-label" for="reqEmail">${ui.requestEmail}</label>
            <input class="req-input" id="reqEmail" type="email" placeholder="${ui.requestEmailPh}">
          </div>
          <div class="req-error" id="reqError"></div>
          <button class="req-submit" id="reqSubmit" onclick="submitRequest()">${ui.requestSubmit}</button>
        </div>
        <div class="req-success" id="reqSuccess" style="display:none">
          <div class="req-success-icon">🌱</div>
          <div class="req-success-title">${ui.requestDone}</div>
          <div class="req-success-sub">${ui.requestDoneSub}</div>
          <button class="req-another" onclick="resetRequestForm()">${ui.requestAnother}</button>
        </div>` : `
        <div class="req-not-configured">
          <p>${ui.requestConfig}</p>
        </div>`}
      </div>
    </div>`;

  document.getElementById("pageWrap").appendChild(wrap);
}

async function submitRequest() {
  const ui      = u();
  const nameEl  = document.getElementById("reqName");
  const whyEl   = document.getElementById("reqWhy");
  const emailEl = document.getElementById("reqEmail");
  const submitBtn = document.getElementById("reqSubmit");
  const errorEl = document.getElementById("reqError");

  const name  = nameEl.value.trim();
  const why   = whyEl.value.trim();
  const email = emailEl.value.trim();

  errorEl.textContent = "";
  if (!name) { nameEl.focus(); errorEl.textContent = "⚠ " + ui.requestName + " *"; return; }

  submitBtn.textContent = ui.requestSending;
  submitBtn.disabled    = true;

  // Build form-encoded body for Google Forms
  const body = new URLSearchParams();
  body.append(FORM_CONFIG.FIELDS.name,  name);
  if (FORM_CONFIG.FIELDS.why)   body.append(FORM_CONFIG.FIELDS.why,   why);
  if (FORM_CONFIG.FIELDS.email) body.append(FORM_CONFIG.FIELDS.email, email);

  try {
    // Google Forms doesn't support CORS so we use no-cors — it always "succeeds"
    await fetch(FORM_CONFIG.ACTION_URL, {
      method: "POST", mode: "no-cors",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });
    document.getElementById("reqFormWrap").style.display = "none";
    document.getElementById("reqSuccess").style.display  = "block";
  } catch {
    submitBtn.textContent = ui.requestSubmit;
    submitBtn.disabled    = false;
    errorEl.textContent   = "⚠ " + ui.requestErr;
  }
}

function resetRequestForm() {
  document.getElementById("reqFormWrap").style.display = "block";
  document.getElementById("reqSuccess").style.display  = "none";
  document.getElementById("reqName").value  = "";
  document.getElementById("reqWhy").value   = "";
  document.getElementById("reqEmail").value = "";
  const btn = document.getElementById("reqSubmit");
  if (btn) { btn.textContent = u().requestSubmit; btn.disabled = false; }
}


function buildNav() {
  const nav = document.getElementById("speciesNav");
  nav.innerHTML = "";

  // "This Month" tab — first in nav
  const monthBtn = document.createElement("button");
  monthBtn.className  = "snav-btn snav-month";
  monthBtn.id         = "navMonthBtn";
  monthBtn.innerHTML  = `<span class="snav-icon">📋</span>${u().monthView}`;
  monthBtn.dataset.id = "__month__";
  monthBtn.onclick    = () => activateMonthView();
  nav.appendChild(monthBtn);

  // Divider
  const div = document.createElement("span");
  div.className = "snav-divider";
  nav.appendChild(div);

  // Species tabs
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
  document.getElementById("monthViewSection").classList.remove("active");
  document.querySelectorAll(".species-section").forEach(s =>
    s.classList.toggle("active", s.id === "sp-" + id)
  );
}

function activateMonthView() {
  document.querySelectorAll(".snav-btn").forEach(b => b.classList.remove("active"));
  document.getElementById("navMonthBtn").classList.add("active");
  document.querySelectorAll(".species-section").forEach(s => s.classList.remove("active"));
  renderMonthView();
  document.getElementById("monthViewSection").classList.add("active");
}

/* ── MONTHLY VIEW ─────────────────────────────────── */
const STORAGE_KEY = "garden_done_";

function taskKey(spId, month, phase, taskText) {
  return `${STORAGE_KEY}${spId}_${month}_${phase}_${taskText.slice(0, 30)}`;
}

function isDone(key) {
  try { return localStorage.getItem(key) === "1"; } catch { return false; }
}

function setDone(key, done) {
  try {
    if (done) localStorage.setItem(key, "1");
    else localStorage.removeItem(key);
  } catch {}
}

function renderMonthView() {
  const ui       = u();
  const section  = document.getElementById("monthViewSection");
  const fullMonths = {
    pt: ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"],
    en: ["January","February","March","April","May","June","July","August","September","October","November","December"],
  };
  const monthName = (fullMonths[LANG] || fullMonths.pt)[NOW_M];

  // Collect all tasks for this month across all species
  let totalTasks = 0, doneTasks = 0;
  const speciesBlocks = [];

  SPECIES.forEach(sp => {
    const monthData = sp.tasks[NOW_M] || sp.tasks[String(NOW_M)];
    if (!monthData || Object.keys(monthData).length === 0) return;

    const taskRows = [];
    Object.entries(monthData).forEach(([phase, phData]) => {
      const tasks = Array.isArray(phData) ? phData : (phData[LANG] || phData.pt || []);
      const p = ph(phase);
      const phaseLabel = ui.phases[phase] || phase;
      tasks.forEach(task => {
        const key  = taskKey(sp.id, NOW_M, phase, task);
        const done = isDone(key);
        totalTasks++;
        if (done) doneTasks++;
        taskRows.push({ key, task, phase, phaseLabel, p, done });
      });
    });

    if (taskRows.length > 0) speciesBlocks.push({ sp, taskRows });
  });

  const pct = totalTasks > 0 ? Math.round(doneTasks / totalTasks * 100) : 0;

  let html = `
    <div class="mv-header">
      <div>
        <h2 class="mv-title">${ui.monthViewSub} <em>${monthName}</em></h2>
        <div class="mv-progress-label">${doneTasks} / ${totalTasks} ${ui.progress}</div>
      </div>
      <div class="mv-actions">
        <button class="mv-action-btn" onclick="clearCompleted()">${ui.clearDone}</button>
        <button class="mv-action-btn mv-reset" onclick="resetAll()">${ui.resetAll}</button>
      </div>
    </div>
    <div class="mv-progress-bar"><div class="mv-progress-fill" style="width:${pct}%"></div></div>`;

  if (speciesBlocks.length === 0) {
    html += `<div class="mv-empty">${ui.noTasksMonth}</div>`;
  } else {
    html += `<div class="mv-grid">`;
    speciesBlocks.forEach(({ sp, taskRows }) => {
      const spDone  = taskRows.filter(r => r.done).length;
      const spTotal = taskRows.length;
      html += `
        <div class="mv-card" id="mvc-${sp.id}">
          <div class="mv-card-head">
            <span class="mv-card-icon">${sp.icon}</span>
            <span class="mv-card-name">${t(sp.name)}</span>
            <span class="mv-card-count">${spDone}/${spTotal}</span>
          </div>
          <div class="mv-card-body">`;
      taskRows.forEach(({ key, task, phase, phaseLabel, p, done }) => {
        html += `
            <label class="mv-task${done ? " mv-task-done" : ""}" data-key="${key}">
              <input type="checkbox" class="mv-check" data-key="${key}"${done ? " checked" : ""}>
              <span class="mv-task-dot" style="background:${p.bar}"></span>
              <span class="mv-task-text">${task}</span>
            </label>`;
      });
      html += `</div></div>`;
    });
    html += `</div>`;
  }

  section.innerHTML = html;

  // Wire up checkboxes
  section.querySelectorAll(".mv-check").forEach(cb => {
    cb.addEventListener("change", () => {
      setDone(cb.dataset.key, cb.checked);
      renderMonthView(); // re-render to update progress
      document.getElementById("navMonthBtn").classList.add("active");
      document.getElementById("monthViewSection").classList.add("active");
    });
  });
}

function clearCompleted() {
  SPECIES.forEach(sp => {
    const monthData = sp.tasks[NOW_M] || sp.tasks[String(NOW_M)];
    if (!monthData) return;
    Object.entries(monthData).forEach(([phase, phData]) => {
      const tasks = Array.isArray(phData) ? phData : (phData[LANG] || phData.pt || []);
      tasks.forEach(task => setDone(taskKey(sp.id, NOW_M, phase, task), false));
    });
  });
  renderMonthView();
  document.getElementById("navMonthBtn").classList.add("active");
  document.getElementById("monthViewSection").classList.add("active");
}

function resetAll() {
  try {
    Object.keys(localStorage)
      .filter(k => k.startsWith(STORAGE_KEY))
      .forEach(k => localStorage.removeItem(k));
  } catch {}
  renderMonthView();
  document.getElementById("navMonthBtn").classList.add("active");
  document.getElementById("monthViewSection").classList.add("active");
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
  const monthViewWasActive = document.getElementById("monthViewSection")?.classList.contains("active");

  document.getElementById("pageWrap").innerHTML = "";

  // Re-create month view section
  const mvSection = document.createElement("div");
  mvSection.id = "monthViewSection";
  mvSection.className = "month-view-section";
  document.getElementById("pageWrap").appendChild(mvSection);

  buildNav();
  SPECIES.forEach((sp, i) => buildSection(sp, i === 0));
  buildRequestSection();
  updateMasthead();

  if (monthViewWasActive) {
    activateMonthView();
  } else if (activeId && activeId !== "__month__") {
    activateSpecies(activeId);
    const mBtn = document.querySelector(`#sp-${activeId} .m-btn[data-m="${activeM}"]`);
    if (mBtn) {
      document.querySelectorAll(`#sp-${activeId} .m-btn`).forEach(b => b.classList.remove("active"));
      mBtn.classList.add("active");
      renderTasks(SPECIES.find(s => s.id === activeId), activeM);
    }
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
  document.getElementById("btnPT").classList.add("active");
  document.getElementById("btnEN").classList.remove("active");
  updateMasthead();
  renderMoonWidget("pt");
  initWeather("pt");

  try {
    const loadingMsg = document.getElementById("loadingMsg");
    if (loadingMsg) loadingMsg.textContent = u().loading;

    SPECIES = await loadSpeciesData();
    LOADED  = true;

    document.getElementById("loadingState")?.remove();
    document.getElementById("snavLoading")?.remove();

    // Create month view section in page
    const mvSection = document.createElement("div");
    mvSection.id = "monthViewSection";
    mvSection.className = "month-view-section";
    document.getElementById("pageWrap").appendChild(mvSection);

    buildNav();
    SPECIES.forEach((sp, i) => buildSection(sp, i === 0));
    buildRequestSection();

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
