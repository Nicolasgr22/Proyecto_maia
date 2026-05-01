import React, { useState, useCallback } from 'react';
import TopNav from './components/TopNav';
import Step1PropertyForm from './components/Step1PropertyForm';
import Step2Valuation from './components/Step2Valuation';
import Step3Analysis from './components/Step3Analysis';
import LoadingOverlay from './components/LoadingOverlay';
import Toast from './components/Toast';
import { API_BASE } from './config';

// Maps form state to PropertyInput API schema
function buildApiPayload(f) {
  const TODAY = new Date().getFullYear();
  const hasBasement = f.hasBasement && parseFloat(f.sqft_basement) > 0;
  const sqft_living = parseFloat(f.sqft_living) || 0;
  const sqft_basement = hasBasement ? parseFloat(f.sqft_basement) : 0;
  const sqft_above = sqft_living - sqft_basement;
  const yr_built = f.yrAge >= TODAY ? TODAY : (f.yrAge || 1900);

  return {
    bedrooms:      f.bedrooms,
    bathrooms:     f.bathrooms,
    sqft_living:   sqft_living,
    sqft_lot:      f.sqft_lot ? parseFloat(f.sqft_lot) : null,
    floors:        f.floors,
    condition:     f.condition,
    grade:         f.grade,
    sqft_above:    sqft_above,
    sqft_basement: sqft_basement,
    yr_built:      yr_built,
    yr_renovated:  0,
    lat:           f.lat,
    long:          f.long,
  };
}

export default function App() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Calculando valoración…');
  const [toast, setToast] = useState({ visible: false, message: '' });
  const [valuation, setValuation] = useState(null);
  const [pricesData, setPricesData] = useState([]);

  const showToast = useCallback((msg) => {
    setToast({ visible: true, message: msg });
    setTimeout(() => setToast({ visible: false, message: '' }), 3500);
  }, []);

  const handleSubmitValuation = async (formData) => {
    setLoadingText('Calculando valoración…');
    setLoading(true);
    try {
      const rawPayload = buildApiPayload(formData);
      const payload = Object.fromEntries(
        Object.entries(rawPayload).filter(([, v]) => v !== null)
      );
      const res = await fetch(`${API_BASE}/valuations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error('[MAIA] /valuations error:', err);
        const msg = typeof err.detail === 'string'
          ? err.detail
          : JSON.stringify(err.detail) || `Error ${res.status}`;
        throw new Error(msg);
      }
      const result = await res.json();
      console.log('[MAIA] /valuations:', result);
      setValuation(result);
      setStep(2);
    } catch (err) {
      showToast(err.message || 'No se pudo obtener la valoración. Inténtalo de nuevo.');
      console.error('[MAIA] Valuation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewAnalysis = async () => {
    setLoadingText('Cargando análisis de mercado…');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/prices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error('[MAIA] /prices error:', err);
        throw new Error(`API ${res.status}`);
      }
      const prices = await res.json();
      console.log('[MAIA] /prices:', prices);
      setPricesData(prices);
      setStep(3);
    } catch (err) {
      showToast('No se pudo cargar el análisis. Inténtalo de nuevo.');
      console.error('[MAIA] Prices error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    const price = valuation ? fmt(valuation.precio_estimado) : '';
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'MAIA · Mi Valoración Inmobiliaria',
          text: `Mi propiedad está valorada en ${price} según MAIA.`,
        });
      } else {
        await navigator.clipboard.writeText(
          `Mi propiedad está valorada en ${price} según MAIA.`
        );
        showToast('Enlace copiado al portapapeles');
      }
    } catch {
      /* user cancelled */
    }
  };

  const handleContactExpert = () => {
    const price = valuation ? fmt(valuation.precio_estimado) : '';
    window.location.href = `mailto:expert@maia.app?subject=Solicitar tasación profesional&body=Hola, me interesa una tasación oficial. Mi estimación MAIA es: ${price}`;
  };

  return (
    <div className="app-shell">
      <TopNav
        step={step}
        onBack={step > 1 ? () => setStep(step - 1) : null}
        onShare={step > 1 ? handleShare : null}
      />
      <div className="screens-container">
        {step === 1 && (
          <Step1PropertyForm onSubmit={handleSubmitValuation} />
        )}
        {step === 2 && (
          <Step2Valuation
            valuation={valuation}
            onViewAnalysis={handleViewAnalysis}
            onContactExpert={handleContactExpert}
          />
        )}
        {step === 3 && (
          <Step3Analysis
            valuation={valuation}
            pricesData={pricesData}
            onContactExpert={handleContactExpert}
          />
        )}
      </div>
      <LoadingOverlay visible={loading} text={loadingText} />
      <Toast visible={toast.visible} message={toast.message} />
    </div>
  );
}

function fmt(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
