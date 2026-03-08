import React from 'react';

const STEP_CONFIG = {
  1: { title: 'Datos del Inmueble',  progress: 33  },
  2: { title: 'Tu Valoración',       progress: 66  },
  3: { title: 'Análisis de Mercado', progress: 100 },
};

export default function TopNav({ step, onBack, onShare }) {
  const cfg = STEP_CONFIG[step] || STEP_CONFIG[1];

  return (
    <div className="top-nav">
      <header className="app-bar">
        {onBack ? (
          <button className="icon-btn" aria-label="Volver" onClick={onBack}>
            <span className="material-symbols-rounded">arrow_back</span>
          </button>
        ) : (
          <div className="app-bar__spacer" />
        )}

        <h1 className="app-bar__title">{cfg.title}</h1>

        {onShare ? (
          <button className="icon-btn" aria-label="Compartir" onClick={onShare}>
            <span className="material-symbols-rounded">share</span>
          </button>
        ) : (
          <div className="app-bar__spacer" />
        )}
      </header>

      <div className="step-progress">
        <div className="step-dots" role="navigation" aria-label="Pasos del proceso">
          {[1, 2, 3].map((n, i) => (
            <React.Fragment key={n}>
              <div
                className={`step-dot ${step === n ? 'active' : ''} ${step > n ? 'completed' : ''}`}
                aria-label={`Paso ${n}`}
              >
                <span className="step-dot__num">{n}</span>
                <span className="step-dot__label">
                  {n === 1 ? 'Datos' : n === 2 ? 'Valoración' : 'Análisis'}
                </span>
              </div>
              {i < 2 && (
                <div className={`step-line ${step > n ? 'completed' : ''}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        <div
          className="progress-track"
          role="progressbar"
          aria-valuenow={cfg.progress}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div className="progress-fill" style={{ width: `${cfg.progress}%` }} />
        </div>
      </div>
    </div>
  );
}
