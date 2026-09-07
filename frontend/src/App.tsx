import { useEffect } from 'react';
import { BagIcon, LockIcon } from './components/Icons';
import { StepIndicator } from './components/StepIndicator';
import { PaymentInfoPage } from './pages/PaymentInfoPage';
import { ProductPage } from './pages/ProductPage';
import { ResultPage } from './pages/ResultPage';
import { SummaryPage } from './pages/SummaryPage';
import { useAppSelector } from './store/hooks';

export function App() {
  const step = useAppSelector((state) => state.checkout.step);

  // Cada paso es una pantalla distinta: si el scroll se queda donde estaba, la
  // persona aterriza a media página y parece que la app se rompió.
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia?.(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    });
  }, [step]);

  return (
    <main className="app">
      <header className="app__header">
        <h1 className="brand">
          <span className="brand__mark">
            <BagIcon />
          </span>
          <span>Tienda</span>
        </h1>
        <StepIndicator step={step} />
      </header>

      {step === 'PRODUCT' && <ProductPage />}
      {step === 'PAYMENT_INFO' && <PaymentInfoPage />}
      {step === 'SUMMARY' && <SummaryPage />}
      {step === 'RESULT' && <ResultPage />}

      <p className="secure-note">
        <LockIcon />
        Pago cifrado. Tus datos de tarjeta nunca se guardan en nuestros servidores.
      </p>
    </main>
  );
}
