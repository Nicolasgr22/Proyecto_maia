import React, { useRef, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  Title, Tooltip, Legend, Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  Title, Tooltip, Legend, Filler
);

function fmt(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD',
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(amount);
}

function confianzaLabel(c) {
  if (!c) return '—';
  switch (c.toUpperCase()) {
    case 'ALTA':  return 'Alta Confianza';
    case 'MEDIA': return 'Media Confianza';
    case 'BAJA':  return 'Baja Confianza';
    default:      return c;
  }
}

function confianzaChipClass(c) {
  if (!c) return 'confidence-chip';
  switch (c.toUpperCase()) {
    case 'MEDIA': return 'confidence-chip confidence-chip--media';
    case 'BAJA':  return 'confidence-chip confidence-chip--baja';
    default:      return 'confidence-chip';
  }
}

// Map estado to alert card style and icon
function marketStyle(estado) {
  if (!estado) return { cls: 'alert-card--green', icon: 'trending_up', label: '—' };
  switch (estado.toUpperCase()) {
    case 'FRIO':
      return { cls: 'alert-card--blue',  icon: 'ac_unit',    label: 'Mercado Frío' };
    case 'EQUILIBRADO':
      return { cls: 'alert-card--green', icon: 'balance',    label: 'Mercado Equilibrado' };
    case 'CALIENTE':
      return { cls: 'alert-card--red',   icon: 'local_fire_department', label: 'Mercado Caliente' };
    default:
      return { cls: 'alert-card--green', icon: 'trending_up', label: estado };
  }
}

// Format "YYYY-MM" to "MMM YY" for chart labels
function formatMes(mes) {
  if (!mes) return mes;
  const [year, month] = mes.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' });
}

function downloadCSV(pricesData) {
  if (!pricesData || pricesData.length === 0) return;
  const header = 'mes,precio_m2\n';
  const rows   = pricesData.map(d => `${d.mes},${d.precio_m2}`).join('\n');
  const csv    = header + rows;
  const blob   = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url    = URL.createObjectURL(blob);
  const a      = document.createElement('a');
  a.href       = url;
  a.download   = 'precios_mercado.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function Step3Analysis({ valuation, pricesData, onContactExpert }) {
  if (!valuation) return null;

  const { precio_estimado, confianza, mercado } = valuation;
  const mkt   = marketStyle(mercado?.estado);
  const trend = mercado?.tendencia_anual_pct;

  // Build chart data from pricesData
  const chartLabels = (pricesData || []).map(d => formatMes(d.mes));
  const chartValues = (pricesData || []).map(d => d.precio_m2);

  const chartData = {
    labels: chartLabels,
    datasets: [
      {
        label: 'Precio/m²',
        data:  chartValues,
        borderColor:      '#1565C0',
        backgroundColor:  'rgba(21, 101, 192, 0.15)',
        borderWidth:      2.5,
        pointRadius:      3,
        pointHoverRadius: 6,
        pointBackgroundColor: '#1565C0',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1A1C22',
        titleColor: '#FFFFFF',
        bodyColor:  '#C3C7CF',
        padding:    10,
        cornerRadius: 8,
        callbacks: {
          label: ctx => ` $${ctx.raw.toLocaleString('en-US', { minimumFractionDigits: 0 })}/m²`,
        },
      },
    },
    scales: {
      x: {
        grid:  { display: false },
        ticks: {
          font:  { family: 'Roboto', size: 10 },
          color: '#74777F',
          maxTicksLimit: 12,
        },
      },
      y: {
        grid:  { color: 'rgba(0,0,0,0.06)' },
        ticks: {
          font:  { family: 'Roboto', size: 10 },
          color: '#74777F',
          callback: v => `$${(v / 1_000).toFixed(0)}k`,
        },
      },
    },
  };

  return (
    <section className="screen" aria-label="Análisis de Mercado">
      <div className="screen-scroll">

        {/* Estimación actual */}
        <div className="card estimation-card">
          <div className="estimation-card__top">
            <span className="estimation-eyebrow">ESTIMACIÓN ACTUAL</span>
            <span className={confianzaChipClass(confianza)}>
              {confianzaLabel(confianza)}
            </span>
          </div>
          <p className="estimation-price">{fmt(precio_estimado)}</p>
        </div>

        {/* Alerta de mercado */}
        <div className={`alert-card ${mkt.cls}`}>
          <span className="material-symbols-rounded alert-icon">{mkt.icon}</span>
          <div>
            <strong>{mkt.label}</strong>
            <p>{mercado?.descripcion || ''}</p>
          </div>
        </div>

        {/* Evolución del precio */}
        <div className="chart-section">
          <div className="chart-header">
            <div>
              <h3 className="section-title">Evolución del Precio</h3>
              <p className="chart-subtitle">Histórico de precios de mercado</p>
            </div>
            {trend != null && (
              <div className="chart-kpi">
                <p className={`chart-kpi__trend ${trend >= 0 ? 'positive' : 'negative'}`}>
                  {trend >= 0 ? '+' : ''}{trend}% anual
                </p>
              </div>
            )}
          </div>
          <div className="chart-wrap">
            {chartValues.length > 0 ? (
              <Line data={chartData} options={chartOptions} />
            ) : (
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                height: '100%', color: 'var(--clr-outline)', fontSize: '13px',
              }}>
                No hay datos de precios disponibles
              </div>
            )}
          </div>
        </div>

      </div>

      <div className="bottom-bar bottom-bar--duo">
        <button className="btn-primary btn-full" onClick={onContactExpert}>
          <span className="material-symbols-rounded">support_agent</span>
          <span>Consultar Experto</span>
        </button>
        <button
          className="btn-icon"
          aria-label="Descargar datos CSV"
          title="Descargar precios CSV"
          onClick={() => downloadCSV(pricesData)}
        >
          <span className="material-symbols-rounded">save_alt</span>
        </button>
      </div>
    </section>
  );
}
