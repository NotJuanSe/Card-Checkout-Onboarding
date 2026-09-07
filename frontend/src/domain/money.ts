const FORMATTER = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

/** Los montos viajan en centavos para no perder precisión con decimales. */
export function formatCents(cents: number): string {
  return FORMATTER.format(Math.round(cents) / 100);
}
