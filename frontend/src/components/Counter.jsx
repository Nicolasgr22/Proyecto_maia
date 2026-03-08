import React from 'react';

export default function Counter({ value, onChange, min, max, step = 1 }) {
  const dec = () => {
    const next = parseFloat((value - step).toFixed(1));
    if (next >= min) onChange(next);
  };
  const inc = () => {
    const next = parseFloat((value + step).toFixed(1));
    if (next <= max) onChange(next);
  };

  const display = value % 1 === 0 ? String(value) : value.toFixed(1);

  return (
    <div className="counter" role="group">
      <button type="button" className="counter-btn" onClick={dec} aria-label="Reducir" disabled={value <= min}>
        <span className="material-symbols-rounded">remove</span>
      </button>
      <span className="counter-value">{display}</span>
      <button type="button" className="counter-btn counter-btn--add" onClick={inc} aria-label="Aumentar" disabled={value >= max}>
        <span className="material-symbols-rounded">add</span>
      </button>
    </div>
  );
}
