import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

const PUBLIC_KEYS = [
  'VITE_API_URL',
  'VITE_PAYMENT_GATEWAY_URL',
  'VITE_PAYMENT_GATEWAY_PUBLIC_KEY',
] as const;

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  return {
    plugins: [react()],
    server: { port: 5173 },
    define: Object.fromEntries(
      PUBLIC_KEYS.map((key) => [
        `process.env.${key}`,
        JSON.stringify(env[key] ?? ''),
      ]),
    ),
  };
});
