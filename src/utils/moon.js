/**
 * moon.js — Astronomical moon phase calculator
 * No API needed — uses the known lunar synodic cycle (29.530588853 days)
 * referenced to a known new moon on 2000-01-06 18:14 UTC.
 */

const MOON_NAMES = {
  pt: ["Lua Nova", "Crescente", "Quarto Crescente", "Corcunda Crescente",
       "Lua Cheia", "Corcunda Minguante", "Quarto Minguante", "Minguante"],
  en: ["New Moon", "Waxing Crescent", "First Quarter", "Waxing Gibbous",
       "Full Moon", "Waning Gibbous", "Last Quarter", "Waning Crescent"],
};

function getMoonPhase(date = new Date()) {
  const KNOWN_NEW_MOON = new Date(Date.UTC(2000, 0, 6, 18, 14, 0));
  const SYNODIC = 29.530588853;
  const diffDays = (date - KNOWN_NEW_MOON) / 86400000;
  const age = ((diffDays % SYNODIC) + SYNODIC) % SYNODIC;
  const illumination = Math.round((1 - Math.cos(2 * Math.PI * age / SYNODIC)) / 2 * 100);

  let idx;
  if      (age < 1.85)  idx = 0;
  else if (age < 7.38)  idx = 1;
  else if (age < 9.22)  idx = 2;
  else if (age < 14.77) idx = 3;
  else if (age < 16.61) idx = 4;
  else if (age < 22.15) idx = 5;
  else if (age < 23.99) idx = 6;
  else                  idx = 7;

  return { age, illumination, idx };
}

function drawMoonSvg(svgEl, age) {
  const SYNODIC = 29.530588853;
  const phase = age / SYNODIC;
  const R = 15, cx = 18, cy = 18;
  svgEl.innerHTML = "";
  const ns = "http://www.w3.org/2000/svg";

  const disk = document.createElementNS(ns, "circle");
  disk.setAttribute("cx", cx); disk.setAttribute("cy", cy); disk.setAttribute("r", R);
  disk.setAttribute("fill", phase < 0.02 || phase > 0.98 ? "#1a2a22" : "#b8d0e0");
  svgEl.appendChild(disk);

  if (phase > 0.02 && phase < 0.98) {
    const waxing = phase < 0.5;
    const norm = waxing ? phase * 2 : (phase - 0.5) * 2;
    const k = 1 - 2 * norm;
    const rx = Math.abs(k) * R;
    const arcSweep = waxing ? (k < 0 ? "1" : "0") : (k < 0 ? "0" : "1");
    const ellipseSweep = k < 0 ? "0" : "1";
    const d = `M ${cx} ${cy - R} A ${R} ${R} 0 0 ${arcSweep} ${cx} ${cy + R} A ${rx} ${R} 0 0 ${ellipseSweep} ${cx} ${cy - R} Z`;
    const shadow = document.createElementNS(ns, "path");
    shadow.setAttribute("d", d);
    shadow.setAttribute("fill", waxing ? "#1a2a22" : "#b8d0e0");
    svgEl.appendChild(shadow);
  }

  const border = document.createElementNS(ns, "circle");
  border.setAttribute("cx", cx); border.setAttribute("cy", cy); border.setAttribute("r", R);
  border.setAttribute("fill", "none");
  border.setAttribute("stroke", "rgba(255,255,255,0.2)");
  border.setAttribute("stroke-width", "1");
  svgEl.appendChild(border);
}

function renderMoonWidget(lang = "pt") {
  const { age, illumination, idx } = getMoonPhase();
  const name = (MOON_NAMES[lang] || MOON_NAMES.pt)[idx];
  const pct  = lang === "pt"
    ? `${illumination}% iluminada`
    : `${illumination}% illuminated`;

  const nameEl = document.getElementById("moonName");
  const pctEl  = document.getElementById("moonPct");
  const svgEl  = document.getElementById("moonSvg");
  if (nameEl) nameEl.textContent = name;
  if (pctEl)  pctEl.textContent  = pct;
  if (svgEl)  drawMoonSvg(svgEl, age);
}
