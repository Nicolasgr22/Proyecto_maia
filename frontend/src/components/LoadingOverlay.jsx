import React from 'react';

export default function LoadingOverlay({ visible, text = 'Cargando…' }) {
  if (!visible) return null;
  return (
    <div className="loading-overlay" role="alert" aria-live="polite">
      <div className="loading-card">
        <div className="loading-spinner" aria-hidden="true" />
        <p className="loading-title">{text}</p>
        <p className="loading-sub">Analizando datos de mercado de la zona</p>
      </div>
    </div>
  );
}
