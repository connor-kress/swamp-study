import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    // Optional: include file patterns that include .ts files
    include: ['tests/**/*.{test,spec}.ts'],
  },
});
