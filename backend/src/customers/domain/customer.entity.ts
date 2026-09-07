export interface Customer {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  legalId: string;
}

export interface CustomerInput {
  fullName: string;
  email: string;
  phone: string;
  legalId: string;
}

// Sin cuantificadores solapados: cada tramo excluye el punto, así el motor no hace backtracking.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/;
const PHONE_PATTERN = /^\+?\d{7,15}$/;

/** Valida los datos del cliente y devuelve la lista de problemas encontrados. */
export function validateCustomer(input: CustomerInput): string[] {
  const errors: string[] = [];
  if (!input.fullName || input.fullName.trim().length < 3) {
    errors.push('El nombre debe tener al menos 3 caracteres');
  }
  if (!EMAIL_PATTERN.test(input.email ?? '')) {
    errors.push('El correo no tiene un formato válido');
  }
  if (!PHONE_PATTERN.test(input.phone ?? '')) {
    errors.push('El teléfono debe tener entre 7 y 15 dígitos');
  }
  if (!input.legalId || input.legalId.trim().length < 5) {
    errors.push('El documento de identidad no es válido');
  }
  return errors;
}
