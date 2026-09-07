export type DeliveryStatus = 'PENDING' | 'ASSIGNED' | 'CANCELLED';

export interface Delivery {
  id: string;
  customerId: string;
  address: string;
  city: string;
  region: string;
  postalCode: string | null;
  feeCents: number;
  status: string;
}

export interface DeliveryInput {
  customerId: string;
  address: string;
  city: string;
  region: string;
  postalCode?: string | null;
  feeCents: number;
}

/** Tarifa de envío por ciudad; las ciudades no listadas pagan la tarifa nacional. */
const FEE_BY_CITY_CENTS: Record<string, number> = {
  bogota: 1000000,
  medellin: 1200000,
  cali: 1200000,
  barranquilla: 1500000,
};
const NATIONAL_FEE_CENTS = 1800000;

function normalizeCity(city: string): string {
  return city
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function deliveryFeeCents(city: string): number {
  return FEE_BY_CITY_CENTS[normalizeCity(city ?? '')] ?? NATIONAL_FEE_CENTS;
}

export function validateDelivery(
  input: Omit<DeliveryInput, 'customerId' | 'feeCents'>,
): string[] {
  const errors: string[] = [];
  if (!input.address || input.address.trim().length < 5) {
    errors.push('La dirección debe tener al menos 5 caracteres');
  }
  if (!input.city || input.city.trim().length < 3) {
    errors.push('La ciudad es obligatoria');
  }
  if (!input.region || input.region.trim().length < 3) {
    errors.push('El departamento/región es obligatorio');
  }
  return errors;
}
