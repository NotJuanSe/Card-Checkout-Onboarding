import type { CheckoutStep } from '../store/checkoutSlice';

const ORDER: CheckoutStep[] = ['PRODUCT', 'PAYMENT_INFO', 'SUMMARY', 'RESULT'];

export function StepIndicator({ step }: Readonly<{ step: CheckoutStep }>) {
  const current = ORDER.indexOf(step);

  return (
    <ol className="steps" aria-label={`Paso ${current + 1} de ${ORDER.length}`}>
      {ORDER.map((value, index) => (
        <li
          key={value}
          className={`steps__dot ${index <= current ? 'steps__dot--active' : ''}`}
        />
      ))}
    </ol>
  );
}
