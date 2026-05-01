import React, { useState, useCallback } from 'react';
import Counter from './Counter';
import MapPicker from './MapPicker';

const TODAY = new Date().getFullYear();

const CONDITION_LABELS = [
  'Muy deteriorado', 'A reformar', 'Buen estado', 'Reformado', 'A estrenar',
];

const FLOORS_OPTIONS = [
  { value: 1,   label: '1'   },
  { value: 1.5, label: '1.5' },
  { value: 2,   label: '2'   },
  { value: 2.5, label: '2.5' },
  { value: 3,   label: '3+'  },
];

const INITIAL_STATE = {
  sqft_living:  '',
  sqft_lot:     '',
  hasBasement:  false,
  sqft_basement: '',
  bedrooms:     3,
  bathrooms:    2,
  floors:       1,
  condition:    3,
  grade:        7,
  yrAge:        TODAY,
  lat:          47.5112,
  long:         -122.2571,
};

function sliderPct(value, min, max) {
  return (((value - min) / (max - min)) * 100).toFixed(1) + '%';
}

export default function Step1PropertyForm({ onSubmit }) {
  const [form, setForm] = useState(INITIAL_STATE);

  const set = useCallback((key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleBasementToggle = () => {
    setForm(prev => ({
      ...prev,
      hasBasement: !prev.hasBasement,
      sqft_basement: !prev.hasBasement ? prev.sqft_basement : '',
    }));
  };

  const handleMapChange = (lat, lng) => {
    setForm(prev => ({ ...prev, lat, long: lng }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.sqft_living || parseFloat(form.sqft_living) <= 0) {
      alert('Por favor ingresa el área construida habitable.');
      return;
    }
    if (!form.lat || !form.long) {
      alert('Por favor selecciona la ubicación en el mapa.');
      return;
    }
    onSubmit(form);
  };

  const yrBuiltLabel = form.yrAge >= TODAY ? 'Nuevo' : `~${form.yrAge}`;
  const yrBuiltHint  = form.yrAge >= TODAY
    ? 'Construido aproximadamente hoy'
    : `Construido hace unos ${TODAY - form.yrAge} años`;

  return (
    <section className="screen" aria-label="Datos del Inmueble">
      <div className="screen-scroll">
        <div className="screen-header">
          <h2 className="display-title">Cuéntanos sobre tu&nbsp;propiedad</h2>
          <p className="subtitle">
            Cuantos más detalles proporciones, más precisa será nuestra valoración de mercado.
          </p>
        </div>

        <form id="property-form" noValidate onSubmit={handleSubmit}>

          {/* ── Superficies ── */}
          <div className="form-section">
            <p className="form-section__title">
              <span className="material-symbols-rounded form-section__icon">square_foot</span>
              Superficies
            </p>
            <div className="form-grid">

              <div className="field-group field--full">
                <label className="field-label" htmlFor="sqft-living">
                  ÁREA CONSTRUIDA HABITABLE
                </label>
                <div className="text-field">
                  <input
                    type="number" id="sqft-living"
                    placeholder="Ej: 140" min="10" max="15000" step="1"
                    inputMode="numeric"
                    value={form.sqft_living}
                    onChange={e => set('sqft_living', e.target.value)}
                  />
                  <span className="field-suffix">sqft</span>
                </div>
              </div>

              <div className="field-group field--full">
                <div className="field-label-row">
                  <label className="field-label" htmlFor="sqft-lot">ÁREA DEL TERRENO</label>
                  <span className="optional-tag">opcional</span>
                </div>
                <div className="text-field">
                  <input
                    type="number" id="sqft-lot"
                    placeholder="Ej: 525" min="50" max="1800000"
                    inputMode="numeric"
                    value={form.sqft_lot}
                    onChange={e => set('sqft_lot', e.target.value)}
                  />
                  <span className="field-suffix">sqft</span>
                </div>
              </div>

            </div>
          </div>

          {/* ── Habitaciones y Estructura ── */}
          <div className="form-section">
            <p className="form-section__title">
              <span className="material-symbols-rounded form-section__icon">bedroom_parent</span>
              Habitaciones y Estructura
            </p>
            <div className="form-grid">

              <div className="field-group">
                <label className="field-label">HABITACIONES</label>
                <Counter
                  value={form.bedrooms}
                  onChange={v => set('bedrooms', v)}
                  min={1} max={10} step={1}
                />
              </div>

              <div className="field-group">
                <label className="field-label">BAÑOS</label>
                <Counter
                  value={form.bathrooms}
                  onChange={v => set('bathrooms', v)}
                  min={0.5} max={8} step={0.5}
                />
              </div>

              <div className="field-group field--full">
                <label className="field-label">NÚMERO DE PISOS</label>
                <div className="chip-group" role="radiogroup" aria-label="Número de pisos">
                  {FLOORS_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      className={`chip ${form.floors === opt.value ? 'chip--active' : ''}`}
                      onClick={() => set('floors', opt.value)}
                      aria-pressed={form.floors === opt.value}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* ── Sótano ── */}
          <div className="form-section">
            <p className="form-section__title">
              <span className="material-symbols-rounded form-section__icon">foundation</span>
              Sótano
            </p>
            <div className="field-group">
              <div className="toggle-row">
                <div className="toggle-info">
                  <p className="toggle-label">¿TIENE SÓTANO?</p>
                  <p className="toggle-desc">La propiedad cuenta con área habitable bajo el nivel del suelo</p>
                </div>
                <label className="toggle-switch" aria-label="Tiene sótano" onClick={handleBasementToggle}>
                  <div className={`toggle-track ${form.hasBasement ? 'toggle-track--active' : ''}`}>
                    <div className={`toggle-thumb ${form.hasBasement ? 'toggle-thumb--active' : ''}`} />
                  </div>
                </label>
              </div>

              {form.hasBasement && (
                <div className="basement-reveal">
                  <label className="field-label" htmlFor="sqft-basement">ÁREA DEL SÓTANO</label>
                  <div className="text-field">
                    <input
                      type="number" id="sqft-basement"
                      placeholder="Ej: 72" min="1" max="10000"
                      inputMode="numeric"
                      value={form.sqft_basement}
                      onChange={e => set('sqft_basement', e.target.value)}
                    />
                    <span className="field-suffix">sqft</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Estado y Calidad ── */}
          <div className="form-section">
            <p className="form-section__title">
              <span className="material-symbols-rounded form-section__icon">verified</span>
              Estado y Calidad
            </p>

            <div className="field-group">
              <div className="field-label-row">
                <label className="field-label" htmlFor="condition">ESTADO DE CONSERVACIÓN</label>
                <span className="field-badge">{CONDITION_LABELS[form.condition - 1]}</span>
              </div>
              <input
                type="range" id="condition"
                min="1" max="5" step="1"
                value={form.condition}
                className="slider"
                style={{ '--slider-pct': sliderPct(form.condition, 1, 5) }}
                onChange={e => set('condition', parseInt(e.target.value, 10))}
                aria-label="Estado de conservación"
              />
              <div className="slider-marks">
                <span>A reformar</span>
                <span>Reformado</span>
                <span>A estrenar</span>
              </div>
            </div>

            <div className="field-group">
              <div className="field-label-row">
                <label className="field-label" htmlFor="grade">CALIFICACIÓN DE LA CONSTRUCCIÓN</label>
                <span className="field-badge">{form.grade} / 13</span>
              </div>
              <input
                type="range" id="grade"
                min="1" max="13" step="1"
                value={form.grade}
                className="slider"
                style={{ '--slider-pct': sliderPct(form.grade, 1, 13) }}
                onChange={e => set('grade', parseInt(e.target.value, 10))}
                aria-label="Calificación de la construcción"
              />
              <div className="slider-marks">
                <span>Básica</span>
                <span>Estándar</span>
                <span>Lujo</span>
              </div>
            </div>
          </div>

          {/* ── Antigüedad ── */}
          <div className="form-section">
            <p className="form-section__title">
              <span className="material-symbols-rounded form-section__icon">history</span>
              Antigüedad
              <span className="optional-tag">opcional</span>
            </p>
            <div className="field-group">
              <div className="field-label-row">
                <label className="field-label" htmlFor="yr-age">¿QUÉ TAN ANTIGUO ES EL INMUEBLE?</label>
                <span className="field-badge">{yrBuiltLabel}</span>
              </div>
              <input
                type="range" id="yr-age"
                min="1900" max={TODAY} step="1"
                value={form.yrAge}
                className="slider age-slider"
                style={{ '--slider-pct': sliderPct(form.yrAge, 1900, TODAY) }}
                onChange={e => set('yrAge', parseInt(e.target.value, 10))}
                aria-label="Año de construcción del inmueble"
              />
              <div className="age-track-labels">
                <span>~1900</span>
                <span>Nuevo</span>
              </div>
              <p className="field-hint age-hint">{yrBuiltHint}</p>
            </div>
          </div>

          {/* ── Ubicación ── */}
          <div className="form-section">
            <p className="form-section__title">
              <span className="material-symbols-rounded form-section__icon">location_on</span>
              Ubicación en King County
            </p>
            <div className="field-group">
              <p className="field-hint">
                Haz clic en el mapa para seleccionar la ubicación exacta de la propiedad.
              </p>
              <MapPicker
                lat={form.lat}
                lng={form.long}
                onChange={handleMapChange}
              />
            </div>
          </div>

        </form>
      </div>

      <div className="bottom-bar">
        <button className="btn-primary btn-full" onClick={handleSubmit}>
          <span>Obtener Valoración</span>
          <span className="material-symbols-rounded">trending_up</span>
        </button>
        <p className="bottom-note">La valoración se basa en datos de mercado actualizados hoy.</p>
      </div>
    </section>
  );
}
