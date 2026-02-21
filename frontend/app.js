/**
 * MAIA · Valoración Inmobiliaria
 * Frontend Application — Vanilla JS (ES Modules)
 *
 * Datos del modelo (CSV):
 *   bedrooms, bathrooms, sqft_living, sqft_lot, floors,
 *   waterfront, view, condition, grade, sqft_above,
 *   sqft_basement, yr_built, yr_renovated, zipcode, lat, long,
 *   sqft_living15, sqft_lot15
 *
 * API schema (PropertyInput):
 *   area, rooms, bathrooms, floor, grade,
 *   lot_area?, year_built?, year_renovated?, location
 */

// ─────────────────────────────────────────────────────────────
// Config
// ─────────────────────────────────────────────────────────────
const API_BASE = 'http://localhost:8000';
const USE_MOCK  = true;   // Set false when API is live

// ─────────────────────────────────────────────────────────────
// App State
// ─────────────────────────────────────────────────────────────
const App = {
  currentStep: 1,
  formData: null,
  valuation: null,
  priceChart: null,
};

// ─────────────────────────────────────────────────────────────
// Navigation
// ─────────────────────────────────────────────────────────────

// Config per step: shared header title, back target, show share
const STEP_CONFIG = {
  1: { title: 'Datos del Inmueble',  back: null, share: false, progress: 33  },
  2: { title: 'Tu Valoración',       back: 1,    share: true,  progress: 66  },
  3: { title: 'Análisis de Mercado', back: 2,    share: true,  progress: 100 },
};

function goToStep(n) {
  const cfg = STEP_CONFIG[n];

  // ── Screens ──
  document.querySelectorAll('.screen').forEach((s, i) => {
    s.classList.toggle('active', i + 1 === n);
  });

  // ── Shared title ──
  const titleEl = qs('#nav-title');
  if (titleEl) titleEl.textContent = cfg.title;

  // ── Back button ──
  const backBtn     = qs('#nav-back');
  const spacerLeft  = qs('#spacer-left');
  if (backBtn && spacerLeft) {
    if (cfg.back !== null) {
      backBtn.removeAttribute('hidden');
      backBtn.onclick = () => goToStep(cfg.back);
      spacerLeft.setAttribute('hidden', '');
    } else {
      backBtn.setAttribute('hidden', '');
      spacerLeft.removeAttribute('hidden');
    }
  }

  // ── Share button ──
  const shareBtn    = qs('#nav-share');
  const spacerRight = qs('#spacer-right');
  if (shareBtn && spacerRight) {
    if (cfg.share) {
      shareBtn.removeAttribute('hidden');
      spacerRight.setAttribute('hidden', '');
    } else {
      shareBtn.setAttribute('hidden', '');
      spacerRight.removeAttribute('hidden');
    }
  }

  // ── Step dots ──
  document.querySelectorAll('.step-dot').forEach(dot => {
    const dotStep = parseInt(dot.dataset.step, 10);
    dot.classList.toggle('active',    dotStep === n);
    dot.classList.toggle('completed', dotStep < n);
  });

  // ── Connector lines ──
  document.querySelectorAll('.step-line').forEach((line, i) => {
    line.classList.toggle('completed', i + 1 < n);
  });

  // ── Progress bar ──
  const fill = qs('#progress-fill');
  const bar  = qs('#main-progress-bar');
  if (fill) fill.style.width = `${cfg.progress}%`;
  if (bar)  bar.setAttribute('aria-valuenow', cfg.progress);

  App.currentStep = n;

  // ── Scroll new screen to top ──
  requestAnimationFrame(() => {
    qs('.screen.active .screen-scroll')?.scrollTo(0, 0);
  });
}

window.goToStep = goToStep;
window.goHome   = () => goToStep(1);

// ─────────────────────────────────────────────────────────────
// Counter Component
// ─────────────────────────────────────────────────────────────
const COUNTER_CONFIG = {
  bedrooms:  { min: 1, max: 10,  step: 1 },
  bathrooms: { min: 0.5, max: 8, step: 0.5 },
};

function initCounters() {
  document.querySelectorAll('.counter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.target;
      const action = btn.dataset.action;
      const input   = document.getElementById(target);
      const display = document.getElementById(`${target}-display`);
      const cfg     = COUNTER_CONFIG[target];

      let val = parseFloat(input.value);
      val = action === 'inc'
        ? Math.min(val + cfg.step, cfg.max)
        : Math.max(val - cfg.step, cfg.min);

      input.value       = val;
      display.textContent = val % 1 === 0 ? val : val.toFixed(1);

      // Visual pulse
      display.animate(
        [{ transform: 'scale(1)' }, { transform: 'scale(1.25)' }, { transform: 'scale(1)' }],
        { duration: 200, easing: 'ease-out' }
      );
    });
  });
}

// ─────────────────────────────────────────────────────────────
// Slider Component
// ─────────────────────────────────────────────────────────────
const CONDITION_LABELS = [
  'Muy deteriorado', 'A reformar', 'Buen estado', 'Reformado', 'A estrenar',
];

function initSliders() {
  // Condition slider
  const condEl    = document.getElementById('condition');
  const condLabel = document.getElementById('condition-label');
  const updateCond = () => {
    const v = parseInt(condEl.value, 10);
    condLabel.textContent = CONDITION_LABELS[v - 1];
    updateSliderFill(condEl);
  };
  condEl.addEventListener('input', updateCond);
  updateCond();

  // Grade slider
  const gradeEl    = document.getElementById('grade');
  const gradeLabel = document.getElementById('grade-label');
  const updateGrade = () => {
    gradeLabel.textContent = `${gradeEl.value} / 13`;
    updateSliderFill(gradeEl);
  };
  gradeEl.addEventListener('input', updateGrade);
  updateGrade();
}

function updateSliderFill(slider) {
  const min = parseFloat(slider.min);
  const max = parseFloat(slider.max);
  const val = parseFloat(slider.value);
  const pct = ((val - min) / (max - min)) * 100;
  slider.style.setProperty('--slider-pct', `${pct.toFixed(1)}%`);
}

// ─────────────────────────────────────────────────────────────
// Basement Toggle
// ─────────────────────────────────────────────────────────────
function initBasementToggle() {
  const toggle  = document.getElementById('has-basement');
  const reveal  = document.getElementById('basement-reveal');
  if (!toggle || !reveal) return;

  toggle.addEventListener('change', () => {
    if (toggle.checked) {
      reveal.removeAttribute('hidden');
      document.getElementById('sqft-basement')?.focus();
    } else {
      reveal.setAttribute('hidden', '');
      const inp = document.getElementById('sqft-basement');
      if (inp) inp.value = '';
    }
  });
}

// ─────────────────────────────────────────────────────────────
// Age Slider (yr_built)  — viejo (1900, izq.) → nuevo (hoy, der.)
// ─────────────────────────────────────────────────────────────
function initAgeSlider() {
  const slider   = document.getElementById('yr-age');
  const badge    = document.getElementById('age-label');
  const hint     = document.getElementById('age-hint');
  const hiddenYr = document.getElementById('yr-built');
  if (!slider) return;

  const TODAY = new Date().getFullYear();
  slider.min   = '1900';
  slider.max   = String(TODAY);
  slider.value = String(TODAY);   // default = new

  const update = () => {
    const yr = parseInt(slider.value, 10);
    updateSliderFill(slider);

    if (yr >= TODAY) {
      badge.textContent = 'Nuevo';
      hint.textContent  = 'Construido aproximadamente hoy';
      hiddenYr.value    = '';        // → API treats as null
    } else {
      const age = TODAY - yr;
      badge.textContent = `~${yr}`;
      hint.textContent  = `Construido hace unos ${age} años`;
      hiddenYr.value    = String(yr);
    }
  };

  slider.addEventListener('input', update);
  update();
}

// ─────────────────────────────────────────────────────────────
// Form Data Collection
// ─────────────────────────────────────────────────────────────

// User inputs m² → model expects sqft
const M2_TO_SQFT = 10.7639;

function collectFormData() {
  const fd = new FormData(document.getElementById('property-form'));
  const get = (key, fallback) => fd.get(key) ?? fallback;

  // Basement: only read area if toggle is checked
  const hasBasement = document.getElementById('has-basement')?.checked;
  let sqft_basement = 0;
  if (hasBasement) {
    const bm2 = parseFloat(get('sqft_basement'));
    sqft_basement = bm2 ? bm2 * M2_TO_SQFT : null;
  }

  // yr_built: read from hidden field (set by age slider); empty string → null
  const yrVal  = get('yr_built', '');
  const yr_built = yrVal ? (parseInt(yrVal, 10) || null) : null;

  // m² inputs → convert to sqft for the model
  const lot_m2   = parseFloat(get('sqft_lot'));
  const above_m2 = parseFloat(get('sqft_above'));

  return {
    // Core
    sqft_living: (parseFloat(get('sqft_living')) || 140) * M2_TO_SQFT,
    bedrooms:    parseInt(document.getElementById('bedrooms').value, 10) || 3,
    bathrooms:   parseFloat(document.getElementById('bathrooms').value)  || 2,
    floors:      parseFloat(get('floors', 1))      || 1,
    condition:   parseInt(get('condition', 3), 10) || 3,
    grade:       parseInt(get('grade', 7), 10)     || 7,

    // Areas (main form) — converted from m²
    sqft_lot:      lot_m2   ? lot_m2   * M2_TO_SQFT : null,
    sqft_above:    above_m2 ? above_m2 * M2_TO_SQFT : null,
    sqft_basement,

    // Optional model features
    waterfront:   get('waterfront') === '1' ? 1 : 0,
    view:         parseInt(get('view', 0), 10) || 0,
    yr_built,
    yr_renovated: parseInt(get('yr_renovated'), 10) || null,

    // Location
    zipcode: get('zipcode', '98178') || '98178',
    lat:     parseFloat(get('lat'))  || 47.5112,
    long:    parseFloat(get('long')) || -122.2571,
  };
}

// Maps frontend fields → PropertyInput schema
function buildApiPayload(d) {
  return {
    area:           d.sqft_living,
    rooms:          d.bedrooms,
    bathrooms:      d.bathrooms,
    floor:          d.floors,
    grade:          d.grade,
    lot_area:       d.sqft_lot,
    year_built:     d.yr_built,
    year_renovated: d.yr_renovated,
    location: {
      latitude:    d.lat,
      longitude:   d.long,
      postal_code: d.zipcode,
    },
  };
}

// ─────────────────────────────────────────────────────────────
// Mock Pricing Engine (mirrors XGBoost feature space)
// ─────────────────────────────────────────────────────────────
function estimatePrice(d) {
  // Base: avg price per sqft in King County ≈ $200
  let price = d.sqft_living * 200;

  // Bedrooms / bathrooms delta from median (3 / 2)
  price += (d.bedrooms  - 3) * 14_000;
  price += (d.bathrooms - 2) * 10_000;

  // Floors (multi-story adds value)
  price += (d.floors - 1) * 8_000;

  // Condition (1–5, median 3)
  price += (d.condition - 3) * 22_000;

  // Grade (1–13, median ~7)
  price += (d.grade - 7) * 18_000;

  // View (0–4)
  price += d.view * 28_000;

  // Waterfront premium
  price += d.waterfront * 190_000;

  // Basement adds living area
  if (d.sqft_basement) price += d.sqft_basement * 80;

  // Age depreciation / renovation boost
  if (d.yr_built) {
    const age = 2024 - d.yr_built;
    price -= Math.min(age * 400, 60_000);
  }
  if (d.yr_renovated && d.yr_renovated > 2000) {
    price += Math.min((d.yr_renovated - 2000) * 500, 40_000);
  }

  return Math.max(price, 80_000);
}

// ─────────────────────────────────────────────────────────────
// Mock API Response
// ─────────────────────────────────────────────────────────────
function generateMockValuation(d) {
  const mid    = estimatePrice(d);
  const margin = mid * 0.04;
  const min    = Math.round((mid - margin) / 1_000) * 1_000;
  const max    = Math.round((mid + margin) / 1_000) * 1_000;
  const zoneAvg = Math.round(mid * 0.945 / 1_000) * 1_000;
  const vsZone  = Math.round((mid / zoneAvg - 1) * 100);
  const temp    = Math.min(Math.max(40 + d.view * 12 + (d.condition - 3) * 8, 5), 95);

  const marketMsg = temp > 65
    ? 'Mercado muy activo en tu zona. Las propiedades similares se venden en menos de 15 días. Es un excelente momento para vender.'
    : temp > 40
    ? 'El mercado está equilibrado. Hay buena demanda y oferta razonable en la zona.'
    : 'El mercado está más frío. Las propiedades tardan más en venderse. Considera ajustar el precio.';

  return {
    id:             `mock-${Date.now()}`,
    precio_estimado: { minimo: min, maximo: max, precio_medio: Math.round((min + max) / 2) },
    confianza:      d.sqft_living > 600 && d.zipcode ? 'ALTA' : 'MEDIA',
    margen_error_pct: 4.0,
    mercado: {
      temperatura:       temp,
      precio_medio_zona: zoneAvg,
      tendencia_anual_pct: 4.2,
      mensaje:           marketMsg,
      vs_zona_pct:       vsZone,
    },
    inmueble:   d,
    creado_en:  new Date().toISOString(),
  };
}

// ─────────────────────────────────────────────────────────────
// Submit Valuation
// ─────────────────────────────────────────────────────────────
async function submitValuation() {
  const data = collectFormData();
  App.formData = data;
  showLoading('Calculando valoración…');

  try {
    let result;
    if (USE_MOCK) {
      await delay(2000);
      result = generateMockValuation(data);
    } else {
      const res = await fetch(`${API_BASE}/valuation`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(buildApiPayload(data)),
      });
      if (!res.ok) throw new Error(`API ${res.status}`);
      result = await res.json();
    }

    App.valuation = result;
    renderValuationResult(result);
    hideLoading();
    goToStep(2);
  } catch (err) {
    hideLoading();
    showToast('No se pudo obtener la valoración. Inténtalo de nuevo.');
    console.error('[MAIA] Valuation error:', err);
  }
}

window.submitValuation = submitValuation;

// ─────────────────────────────────────────────────────────────
// Render — Step 2: Valuation Result
// ─────────────────────────────────────────────────────────────
function renderValuationResult(r) {
  const { precio_estimado: pe, confianza, mercado: m } = r;

  // Price range
  qs('#price-range').textContent =
    `${fmt(pe.minimo)} – ${fmt(pe.maximo)}`;

  // Analysis price (midpoint)
  qs('#analysis-price').textContent = fmt(pe.precio_medio);

  // Confidence
  const confLabel = confianza === 'ALTA' ? 'Alta'
                  : confianza === 'MEDIA' ? 'Media' : 'Baja';
  qs('#confidence-text').textContent     = confLabel;
  qs('#analysis-conf-chip').textContent  = `${confLabel} Confianza`;

  // Confidence icon colour
  const icon = qs('#confidence-badge .confidence-icon');
  icon.style.color = confianza === 'ALTA' ? 'var(--clr-positive)'
                   : confianza === 'MEDIA' ? '#F9A825'
                   : 'var(--clr-negative)';

  // Thermometer
  qs('#market-dot').style.left = `${m.temperatura}%`;
  qs('#market-text').textContent = m.mensaje;

  // Zone comparison
  qs('#zone-avg-price').textContent = fmt(m.precio_medio_zona);
  const trendEl = qs('#annual-trend');
  trendEl.textContent = `${m.tendencia_anual_pct > 0 ? '+' : ''}${m.tendencia_anual_pct}%`;
  trendEl.className   = `stat-value ${m.tendencia_anual_pct >= 0 ? 'positive' : 'negative'}`;

  // vs Zone note
  const vsZ = m.vs_zona_pct;
  qs('#vs-zone').textContent =
    `${Math.abs(vsZ)}% ${vsZ >= 0 ? 'superior' : 'inferior'}`;
}

// ─────────────────────────────────────────────────────────────
// Render — Step 3: Market Analysis
// ─────────────────────────────────────────────────────────────
function renderMarketAnalysis(r) {
  const { precio_estimado: pe, mercado: m, inmueble: d } = r;
  const mid = pe.precio_medio;

  // Monthly/margin
  qs('#monthly-change').textContent  = '+3.2% este mes';
  qs('#margin-pct').textContent      = r.margen_error_pct.toFixed(1);

  // price/sqft
  const pricePerSqft = d?.sqft_living ? Math.round(mid / d.sqft_living) : '—';
  qs('#price-per-sqft').textContent = `$${pricePerSqft}/sqft`;
  qs('#kpi-trend').textContent      = `+${m.tendencia_anual_pct}% anual`;

  // Market alert
  const isHot = m.temperatura > 60;
  qs('#alert-title').textContent = isHot ? 'Momento Óptimo para Vender' : 'Mercado en Calma';
  qs('#alert-desc').textContent  = isHot
    ? 'El mercado local está al alza con baja oferta disponible.'
    : 'Tómate tu tiempo para encontrar el mejor precio.';

  // Impacts list
  const impacts = generateImpacts(d || {});
  renderImpactsList(impacts);

  // Neighborhood text
  const propCount = 10 + Math.round(m.temperatura / 10);
  qs('#neighborhood-text').textContent =
    `${propCount} Propiedades similares vendidas recientemente`;

  // Chart
  renderPriceChart(mid);
}

// ─────────────────────────────────────────────────────────────
// Characteristic Impacts Generator
// ─────────────────────────────────────────────────────────────
const ICONS = {
  condition_good:  'home_repair_service',
  condition_bad:   'home_repair_service',
  view_great:      'landscape',
  waterfront:      'water',
  grade_high:      'star',
  grade_low:       'star_border',
  market_tension:  'local_fire_department',
  floors_multi:    'stairs',
  no_reno:         'update',
};

function generateImpacts(d) {
  const impacts = [];

  // Condition
  if (d.condition >= 4) {
    impacts.push({
      icon: ICONS.condition_good, label: 'Estado de Conservación',
      desc: 'Excelente mantenimiento del inmueble', pct: 8, positive: true,
    });
  } else if (d.condition <= 2) {
    impacts.push({
      icon: ICONS.condition_bad, label: 'Estado de Conservación',
      desc: 'Necesita reformas importantes', pct: -10, positive: false,
    });
  }

  // View
  if (d.view >= 3) {
    impacts.push({
      icon: ICONS.view_great, label: 'Vistas Excepcionales',
      desc: 'Zona de alta demanda', pct: 12, positive: true,
    });
  }

  // Waterfront
  if (d.waterfront) {
    impacts.push({
      icon: ICONS.waterfront, label: 'Propiedad Frente al Agua',
      desc: 'Acceso directo al agua', pct: 25, positive: true,
    });
  }

  // Grade
  if (d.grade >= 10) {
    impacts.push({
      icon: ICONS.grade_high, label: 'Calidad Premium',
      desc: 'Construcción de alto nivel', pct: 15, positive: true,
    });
  } else if (d.grade <= 5) {
    impacts.push({
      icon: ICONS.grade_low, label: 'Calidad Básica',
      desc: 'Materiales estándar', pct: -8, positive: false,
    });
  }

  // No recent renovation
  if (d.yr_built && !d.yr_renovated && (2024 - d.yr_built) > 25) {
    impacts.push({
      icon: ICONS.no_reno, label: 'Sin Renovación Reciente',
      desc: `Construido en ${d.yr_built}`, pct: -5, positive: false,
    });
  }

  // Multi-floor
  if (d.floors >= 2) {
    impacts.push({
      icon: ICONS.floors_multi, label: 'Múltiples Plantas',
      desc: `${d.floors} plantas`, pct: -3, positive: false,
    });
  }

  // Market tension (always shown last)
  impacts.push({
    icon: ICONS.market_tension, label: 'Tensión de Mercado',
    desc: 'Poca oferta en el barrio', pct: 4, positive: true,
  });

  return impacts.slice(0, 5);
}

function renderImpactsList(impacts) {
  qs('#impacts-list').innerHTML = impacts.map(({ icon, label, desc, pct, positive }) => `
    <div class="impact-item">
      <div class="impact-icon ${positive ? 'positive' : 'negative'}">
        <span class="material-symbols-rounded">${icon}</span>
      </div>
      <div class="impact-info">
        <p class="impact-label">${label}</p>
        <p class="impact-desc">${desc}</p>
      </div>
      <span class="impact-pct ${positive ? 'positive' : 'negative'}">
        ${positive ? '+' : ''}${pct}%
      </span>
    </div>
  `).join('');
}

// ─────────────────────────────────────────────────────────────
// Price Chart (Chart.js)
// ─────────────────────────────────────────────────────────────
const MONTHS = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN',
                'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];

function renderPriceChart(currentPrice) {
  const prices = buildHistoricalPrices(currentPrice, 12);
  const canvas  = document.getElementById('price-chart');
  const ctx     = canvas.getContext('2d');

  if (App.priceChart) {
    App.priceChart.destroy();
    App.priceChart = null;
  }

  // Gradient fill
  const grad = ctx.createLinearGradient(0, 0, 0, 180);
  grad.addColorStop(0, 'rgba(21, 101, 192, 0.30)');
  grad.addColorStop(1, 'rgba(21, 101, 192, 0.00)');

  App.priceChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: MONTHS,
      datasets: [{
        label: 'Precio',
        data:  prices,
        borderColor:     '#1565C0',
        backgroundColor: grad,
        borderWidth:     2.5,
        pointRadius:     3,
        pointHoverRadius: 6,
        pointBackgroundColor: '#1565C0',
        fill: true,
        tension: 0.4,
      }],
    },
    options: {
      responsive:          true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#1A1C22',
          titleColor:      '#FFFFFF',
          bodyColor:       '#C3C7CF',
          padding:         10,
          cornerRadius:    8,
          callbacks: {
            label: ctx => ` ${fmt(ctx.raw)}`,
          },
        },
      },
      scales: {
        x: {
          grid:  { display: false },
          ticks: { font: { family: 'Roboto', size: 11 }, color: '#74777F' },
        },
        y: {
          grid:  { color: 'rgba(0,0,0,0.06)' },
          ticks: {
            font: { family: 'Roboto', size: 11 },
            color: '#74777F',
            callback: v => `$${(v / 1_000).toFixed(0)}k`,
          },
        },
      },
    },
  });
}

function buildHistoricalPrices(currentPrice, n) {
  const prices   = [];
  const annualGrowth = 0.042;           // 4.2 % annual → 0.35 %/month
  const monthlyGrowth = annualGrowth / 12;
  const base = currentPrice / Math.pow(1 + monthlyGrowth, n - 1);

  // Seeded pseudo-random for stable render
  let seed = Math.floor(currentPrice) % 1000;
  const rand = () => { seed = (seed * 1664525 + 1013904223) & 0xFFFFFFFF; return (seed >>> 0) / 0xFFFFFFFF; };

  for (let i = 0; i < n; i++) {
    const trend = base * Math.pow(1 + monthlyGrowth, i);
    const noise = (rand() - 0.5) * currentPrice * 0.04;
    prices.push(Math.round(trend + noise));
  }
  // Last point = exact current price
  prices[n - 1] = currentPrice;
  return prices;
}

// ─────────────────────────────────────────────────────────────
// Utilities
// ─────────────────────────────────────────────────────────────
function fmt(amount) {
  return new Intl.NumberFormat('en-US', {
    style:                 'currency',
    currency:              'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function qs(selector) { return document.querySelector(selector); }

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

function showLoading(text = 'Cargando…') {
  qs('#loading-text').textContent = text;
  qs('#loading-overlay').classList.remove('hidden');
}

function hideLoading() { qs('#loading-overlay').classList.add('hidden'); }

let toastTimer;
function showToast(msg, duration = 3000) {
  const el = qs('#toast');
  el.textContent = msg;
  el.classList.remove('hidden');
  requestAnimationFrame(() => {
    requestAnimationFrame(() => el.classList.add('show'));
  });
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    el.classList.remove('show');
    setTimeout(() => el.classList.add('hidden'), 250);
  }, duration);
}

// ─────────────────────────────────────────────────────────────
// Share & Contact
// ─────────────────────────────────────────────────────────────
async function shareResult() {
  const priceEl = qs('#price-range');
  const price   = priceEl?.textContent || '';
  try {
    if (navigator.share) {
      await navigator.share({
        title: 'MAIA · Mi Valoración Inmobiliaria',
        text:  `Mi propiedad está valorada en ${price} según MAIA.`,
      });
    } else {
      await navigator.clipboard.writeText(
        `Mi propiedad está valorada en ${price} según MAIA.`
      );
      showToast('Enlace copiado al portapapeles');
    }
  } catch {
    /* user cancelled share */
  }
}

function contactExpert() {
  const price = qs('#price-range')?.textContent || '';
  const mailto = `mailto:expert@maia.app?subject=Solicitar tasación profesional&body=Hola, me interesa una tasación oficial. Mi estimación MAIA es: ${price}`;
  window.location.href = mailto;
}

function saveReport() {
  window.print();
}

window.shareResult   = shareResult;
window.contactExpert = contactExpert;
window.saveReport    = saveReport;

// ─────────────────────────────────────────────────────────────
// Wire up Step 2 → Step 3 CTA
// ─────────────────────────────────────────────────────────────
function setupStep2CTA() {
  qs('#view-analysis-btn')?.addEventListener('click', () => {
    // Use existing valuation or generate mock with defaults
    const v = App.valuation ?? generateMockValuation(App.formData ?? collectFormData());
    App.valuation = v;
    renderMarketAnalysis(v);
    goToStep(3);
  });
}

// ─────────────────────────────────────────────────────────────
// Init
// ─────────────────────────────────────────────────────────────
function init() {
  initCounters();
  initSliders();
  initBasementToggle();
  initAgeSlider();
  setupStep2CTA();
}

document.addEventListener('DOMContentLoaded', init);
