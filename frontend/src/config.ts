/**
 * Vite reemplaza estas expresiones en tiempo de build (ver vite.config.ts) y
 * Jest las lee de process.env, así el mismo código sirve en navegador y tests.
 */
export const config = {
  apiUrl: process.env.VITE_API_URL || 'http://localhost:3000',
  gatewayUrl: process.env.VITE_PAYMENT_GATEWAY_URL || '',
  gatewayPublicKey: process.env.VITE_PAYMENT_GATEWAY_PUBLIC_KEY || '',
};
