import React from 'react';

export default function Toast({ visible, message }) {
  return (
    <div
      className={`toast ${visible ? 'toast--show' : ''}`}
      role="status"
      aria-live="polite"
    >
      {message}
    </div>
  );
}
