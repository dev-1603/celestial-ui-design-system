import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    environmentMatchGlobs: [
      ['src/environment/**/*.test.ts', 'happy-dom'],
      ['src/accessibility/**/*.test.ts', 'happy-dom'],
      ['src/overlay/**/*.test.ts', 'happy-dom'],
    ],
  },
});
