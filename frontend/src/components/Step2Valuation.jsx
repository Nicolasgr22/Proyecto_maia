import React from 'react';

function fmt(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD',
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(amount);
}

// Map estado to thermometer position
function thermometerPosition(estado) {
  if (!estado) return '50%';
  switch (estado.toUpperCase()) {
    case 'FRIO':        return '15%';
    case 'EQUILIBRADO': return '50%';
    case 'CALIENTE':    return '85%';
    default:            return '50%';
  }
}

// Map confianza label to display text
function confianzaLabel(c) {
  if (!c) return '—';
  switch (c.toUpperCase()) {
    case 'ALTA':  return 'Alta';
    case 'MEDIA': return 'Media';
    case 'BAJA':  return 'Baja';
    default:      return c;
  }
}

// Icon color for confianza
function confianzaColor(c) {
  if (!c) return 'var(--clr-outline)';
  switch (c.toUpperCase()) {
    case 'ALTA':  return 'var(--clr-positive)';
    case 'MEDIA': return '#F9A825';
    case 'BAJA':  return 'var(--clr-negative)';
    default:      return 'var(--clr-outline)';
  }
}

export default function Step2Valuation({ valuation, onViewAnalysis, onContactExpert }) {
  if (!valuation) return null;

  const { precio_estimado, confianza, mercado, nota } = valuation;
  const dotLeft  = thermometerPosition(mercado?.estado);
  const trend    = mercado?.tendencia_anual_pct;
  const trendStr = trend !== undefined && trend !== null
    ? `${trend >= 0 ? '+' : ''}${trend}%`
    : '—';

  return (
    <section className="screen" aria-label="Tu Valoración">
      <div className="screen-scroll">

        {/* Hero precio */}
        <div className="valuation-hero">
          <p className="valuation-hero__eyebrow">ESTIMACIÓN DE MERCADO</p>
          <p className="valuation-hero__price">
            {fmt(precio_estimado)}
          </p>
          <div className="confidence-row">
            <span
              className="material-symbols-rounded confidence-icon"
              style={{ color: confianzaColor(confianza) }}
            >
              check_circle
            </span>
            <span>
              Confianza del cálculo:{' '}
              <strong>{confianzaLabel(confianza)}</strong>
            </span>
          </div>
        </div>

        {/* Estado del mercado */}
        <div className="card card--elevated">
          <div className="card-header">
            <span className="card-emoji">
              {mercado?.estado?.toUpperCase() === 'CALIENTE' ? '🔥'
                : mercado?.estado?.toUpperCase() === 'FRIO' ? '❄️'
                : '⚖️'}
            </span>
            <h3 className="card-title">Estado del Mercado</h3>
          </div>
          <div className="thermometer">
            <div className="thermometer__track">
              <div className="thermometer__dot" style={{ left: dotLeft }} />
            </div>
            <div className="thermometer__labels">
              <span>FRÍO</span>
              <span>EQUILIBRADO</span>
              <span>CALIENTE</span>
            </div>
          </div>
          <div className="market-message">
            <p>{mercado?.descripcion || '—'}</p>
          </div>
        </div>

        {/* Comparativa de zona */}
        <h3 className="section-title">Comparativa de Zona</h3>
        <div className="stats-row">
          <div className="stat-card">
            <span className="stat-icon material-symbols-rounded">location_on</span>
            <p className="stat-label">Precio medio zona</p>
            <p className="stat-value">
              {mercado?.precio_medio_zona != null ? fmt(mercado.precio_medio_zona) : '—'}
            </p>
          </div>
          <div className="stat-card">
            <span className="stat-icon material-symbols-rounded">trending_up</span>
            <p className="stat-label">Tendencia anual</p>
            <p className={`stat-value ${trend >= 0 ? 'positive' : 'negative'}`}>
              {trendStr}
            </p>
          </div>
        </div>

        {/* Nota */}
        <div className="info-note card">
          <span className="material-symbols-rounded note-icon">info</span>
          <p>{nota || '—'}</p>
        </div>

        {/* CTA → Paso 3 */}
        <button className="btn-primary btn-full" onClick={onViewAnalysis}>
          <span className="material-symbols-rounded">analytics</span>
          <span>Ver Análisis Completo</span>
        </button>

      </div>

      <div className="bottom-bar">
        <button className="btn-secondary btn-full" onClick={onContactExpert}>
          <span className="material-symbols-rounded">support_agent</span>
          <span>Contactar tasador profesional</span>
        </button>
        <p className="bottom-note">
          Esta es una estimación automática basada en datos históricos. Para una valoración legal, solicita una tasación oficial.
        </p>
      </div>
    </section>
  );
}
