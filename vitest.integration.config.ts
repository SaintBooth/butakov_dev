import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  test: {
    include: ['src/**/*.int.test.ts'],
    environment: 'node',
    // All files share one database and reset its schema.
    fileParallelism: false,
    testTimeout: 20_000,
  },
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
});
