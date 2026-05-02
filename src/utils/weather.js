/**
 * weather.js — Fetches live weather for Aveiro, Portugal
 * Uses Open-Meteo (https://open-meteo.com/) — completely free, no API key required.
 * Coordinates: Aveiro 40.6405° N, -8.6538° W
 */

const WEATHER_URL =
  "https://api.open-meteo.com/v1/forecast" +
  "?latitude=40.6405&longitude=-8.6538" +
  "&current=temperature_2m,precipitation,windspeed_10m,uv_index" +
  "&windspeed_unit=kmh&timezone=Europe%2FLisbon";

const WX_LABELS = {
  pt: { temp: "Temperatura", rain: "Precipitação", wind: "Vento", uv: "Índice UV" },
  en: { temp: "Temperature",  rain: "Precipitation", wind: "Wind",  uv: "UV Index"  },
};

async function fetchWeather() {
  try {
    const res  = await fetch(WEATHER_URL);
    if (!res.ok) throw new Error("Weather fetch failed");
    const data = await res.json();
    const c    = data.current;
    return {
      temp: Math.round(c.temperature_2m),
      rain: c.precipitation,
      wind: Math.round(c.windspeed_10m),
      uv:   Math.round(c.uv_index),
    };
  } catch (e) {
    console.warn("Weather unavailable:", e.message);
    return null;
  }
}

function renderWeather(wx, lang = "pt") {
  const L = WX_LABELS[lang] || WX_LABELS.pt;

  const set = (id, val, label) => {
    const vEl = document.getElementById(id + "-val");
    const lEl = document.getElementById(id + "-label");
    if (vEl) vEl.textContent = val;
    if (lEl) lEl.textContent = label;
  };

  if (!wx) {
    set("wx-temp", "—", L.temp);
    set("wx-rain", "—", L.rain);
    set("wx-wind", "—", L.wind);
    set("wx-uv",   "—", L.uv);
    return;
  }

  set("wx-temp", `${wx.temp} °C`,    L.temp);
  set("wx-rain", `${wx.rain} mm`,    L.rain);
  set("wx-wind", `${wx.wind} km/h`,  L.wind);
  set("wx-uv",   `${wx.uv}`,         L.uv);
}

async function initWeather(lang = "pt") {
  const wx = await fetchWeather();
  renderWeather(wx, lang);
  // cache result so language switch doesn't re-fetch
  window._wxCache = wx;
}

function updateWeatherLabels(lang = "pt") {
  renderWeather(window._wxCache || null, lang);
}
