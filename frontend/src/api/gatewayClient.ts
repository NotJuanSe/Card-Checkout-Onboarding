import axios from 'axios';
import { config } from '../config';
import { onlyDigits } from '../domain/card';
import type { CardInput } from '../domain/card';

export type TokenizableCard = CardInput;

/**
 * Tokeniza la tarjeta contra la pasarela usando SOLO la llave pública. El
 * número y el CVC nunca salen del navegador hacia nuestro backend: viajan
 * directo a la pasarela y de vuelta llega un token de un solo uso.
 */
export async function tokenizeCard(card: CardInput): Promise<string> {
  const { data } = await axios.post(
    `${config.gatewayUrl}/tokens/cards`,
    {
      number: onlyDigits(card.number),
      cvc: card.cvc,
      exp_month: card.expMonth,
      exp_year: card.expYear,
      card_holder: card.holder,
    },
    {
      headers: {
        Authorization: `Bearer ${config.gatewayPublicKey}`,
      },
      timeout: 20000,
    },
  );

  const token = data?.data?.id;
  if (!token) {
    throw new Error('La pasarela no devolvió un token de tarjeta');
  }
  return token;
}
