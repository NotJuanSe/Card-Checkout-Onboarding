import { StepIndicator } from './components/StepIndicator';
import { PaymentInfoPage } from './pages/PaymentInfoPage';
import { ProductPage } from './pages/ProductPage';
import { ResultPage } from './pages/ResultPage';
import { SummaryPage } from './pages/SummaryPage';
import { useAppSelector } from './store/hooks';

export function App() {
  const step = useAppSelector((state) => state.checkout.step);

  return (
    <main className="app">
      <header className="app__header">
        <h1 className="app__title">Tienda</h1>
        <StepIndicator step={step} />
      </header>

      {step === 'PRODUCT' && <ProductPage />}
      {step === 'PAYMENT_INFO' && <PaymentInfoPage />}
      {step === 'SUMMARY' && <SummaryPage />}
      {step === 'RESULT' && <ResultPage />}
    </main>
  );
}
