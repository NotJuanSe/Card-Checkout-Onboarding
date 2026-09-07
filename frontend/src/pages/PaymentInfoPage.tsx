import { useState } from 'react';
import { CardBrandLogo } from '../components/CardBrandLogo';
import { CardPreview } from '../components/CardPreview';
import { Field } from '../components/Field';
import { AlertIcon, CreditCardIcon, TruckIcon } from '../components/Icons';
import {
  detectBrand,
  formatCardNumber,
  onlyDigits,
  validateCard,
  type CardInput,
} from '../domain/card';
import type { CustomerForm, DeliveryForm } from '../api/types';
import {
  goToStep,
  savePaymentInfo,
  tokenizeCardThunk,
} from '../store/checkoutSlice';
import { useAppDispatch, useAppSelector } from '../store/hooks';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/;

const emptyCard: CardInput = {
  number: '',
  holder: '',
  expMonth: '',
  expYear: '',
  cvc: '',
};

export function PaymentInfoPage() {
  const dispatch = useAppDispatch();
  const { customer, delivery, paymentStatus, error } = useAppSelector(
    (state) => state.checkout,
  );

  const [card, setCard] = useState<CardInput>(emptyCard);
  const [installments, setInstallments] = useState(1);
  const [contact, setContact] = useState<CustomerForm>(
    customer ?? { fullName: '', email: '', phone: '', legalId: '' },
  );
  const [address, setAddress] = useState<DeliveryForm>(
    delivery ?? { address: '', city: '', region: '', postalCode: '' },
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const brand = detectBrand(card.number);

  function validate(): Record<string, string> {
    const cardErrors = validateCard(card);
    const found: Record<string, string> = { ...cardErrors };

    if (contact.fullName.trim().length < 3) {
      found.fullName = 'Escribe tu nombre completo';
    }
    if (!EMAIL_PATTERN.test(contact.email)) {
      found.email = 'Correo inválido';
    }
    if (onlyDigits(contact.phone).length < 7) {
      found.phone = 'Teléfono inválido';
    }
    if (contact.legalId.trim().length < 5) {
      found.legalId = 'Documento inválido';
    }
    if (address.address.trim().length < 5) {
      found.address = 'Dirección demasiado corta';
    }
    if (address.city.trim().length < 3) {
      found.city = 'Ciudad obligatoria';
    }
    if (address.region.trim().length < 3) {
      found.region = 'Departamento obligatorio';
    }
    return found;
  }

  async function handleSubmit(): Promise<void> {
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    dispatch(savePaymentInfo({ customer: contact, delivery: address }));
    await dispatch(tokenizeCardThunk({ card, installments }));
  }

  return (
    <section className="card" aria-labelledby="payment-title">
      <h2 id="payment-title" className="app__title">
        Datos de pago y entrega
      </h2>

      <div className="checkout__grid">
        <aside className="checkout__aside">
          <CardPreview card={card} />
        </aside>

        <div className="checkout__fields">
      <p className="section-title">
        <CreditCardIcon />
        Tarjeta
      </p>

      <Field
        id="card-number"
        label="Número de tarjeta"
        value={formatCardNumber(card.number)}
        placeholder="4242 4242 4242 4242"
        inputMode="numeric"
        maxLength={23}
        autoComplete="cc-number"
        error={errors.number}
        onChange={(value) => setCard({ ...card, number: onlyDigits(value) })}
      >
        <CardBrandLogo brand={brand} />
      </Field>

      <Field
        id="card-holder"
        label="Titular de la tarjeta"
        value={card.holder}
        placeholder="ANA GOMEZ"
        autoComplete="cc-name"
        error={errors.holder}
        onChange={(value) => setCard({ ...card, holder: value.toUpperCase() })}
      />

      <div className="field-group">
        <Field
          id="card-exp"
          label="Vence (MM/AA)"
          value={
            card.expMonth + (card.expYear ? `/${card.expYear}` : '')
          }
          placeholder="08/29"
          inputMode="numeric"
          maxLength={5}
          autoComplete="cc-exp"
          error={errors.expMonth}
          onChange={(value) => {
            const digits = onlyDigits(value).slice(0, 4);
            setCard({
              ...card,
              expMonth: digits.slice(0, 2),
              expYear: digits.slice(2, 4),
            });
          }}
        />
        <Field
          id="card-cvc"
          label="CVC"
          value={card.cvc}
          placeholder="123"
          inputMode="numeric"
          maxLength={4}
          autoComplete="cc-csc"
          error={errors.cvc}
          onChange={(value) => setCard({ ...card, cvc: onlyDigits(value) })}
        />
      </div>

      <div className="field">
        <label className="field__label" htmlFor="installments">
          Cuotas
        </label>
        <select
          id="installments"
          className="field__input"
          value={installments}
          onChange={(event) => setInstallments(Number(event.target.value))}
        >
          {[1, 3, 6, 12].map((value) => (
            <option key={value} value={value}>
              {value} {value === 1 ? 'cuota' : 'cuotas'}
            </option>
          ))}
        </select>
      </div>

      <p className="section-title">
        <TruckIcon />
        Contacto y entrega
      </p>

      <Field
        id="full-name"
        label="Nombre completo"
        value={contact.fullName}
        autoComplete="name"
        error={errors.fullName}
        onChange={(value) => setContact({ ...contact, fullName: value })}
      />
      <Field
        id="email"
        label="Correo electrónico"
        value={contact.email}
        inputMode="email"
        autoComplete="email"
        error={errors.email}
        onChange={(value) => setContact({ ...contact, email: value.trim() })}
      />
      <div className="field-group">
        <Field
          id="phone"
          label="Teléfono"
          value={contact.phone}
          inputMode="tel"
          autoComplete="tel"
          error={errors.phone}
          onChange={(value) => setContact({ ...contact, phone: onlyDigits(value) })}
        />
        <Field
          id="legal-id"
          label="Documento"
          value={contact.legalId}
          inputMode="numeric"
          error={errors.legalId}
          onChange={(value) => setContact({ ...contact, legalId: value })}
        />
      </div>

      <Field
        id="address"
        label="Dirección de entrega"
        value={address.address}
        autoComplete="street-address"
        error={errors.address}
        onChange={(value) => setAddress({ ...address, address: value })}
      />
      <div className="field-group">
        <Field
          id="city"
          label="Ciudad"
          value={address.city}
          autoComplete="address-level2"
          error={errors.city}
          onChange={(value) => setAddress({ ...address, city: value })}
        />
        <Field
          id="region"
          label="Departamento"
          value={address.region}
          autoComplete="address-level1"
          error={errors.region}
          onChange={(value) => setAddress({ ...address, region: value })}
        />
      </div>

      {error && (
        <div className="alert" role="alert">
          <AlertIcon />
          {error}
        </div>
      )}

      <button
        className="button"
        type="button"
        disabled={paymentStatus === 'tokenizing'}
        onClick={() => void handleSubmit()}
      >
        {paymentStatus === 'tokenizing' ? 'Validando tarjeta…' : 'Continuar'}
      </button>
      <button
        className="button button--ghost"
        type="button"
        onClick={() => dispatch(goToStep('PRODUCT'))}
      >
        Volver
      </button>
        </div>
      </div>
    </section>
  );
}
