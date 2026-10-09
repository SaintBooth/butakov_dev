import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  test: {
    include: ['src/**/*.test.{ts,tsx}', 'scripts/**/*.test.ts'],
    exclude: ['**/*.int.test.ts', 'node_modules/**'],
    environment: 'node',
  },
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
});
