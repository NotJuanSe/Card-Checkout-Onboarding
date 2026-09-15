import { ConfigService } from '@nestjs/config';
import { DEFAULT_VAT_RATE } from '../domain/transaction.entity';

/**
 * La tasa se lee de configuración para poder ajustarla sin recompilar, pero se
 * valida: un valor ausente o fuera de rango cae al IVA general vigente.
 */
export function vatRateFrom(config: ConfigService): number {
  const parsed = Number.parseFloat(config.get<string>('VAT_RATE') ?? '');
  return Number.isFinite(parsed) && parsed >= 0 && parsed < 1
    ? parsed
    : DEFAULT_VAT_RATE;
}
