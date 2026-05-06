import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src/ui/react'),
    },
  },
  test: {
    include: ['src/**/*.test.ts', 'src/**/*.spec.ts', 'tests/**/*.test.ts', 'tests/**/*.spec.ts'],
    testTimeout: 10000,
    fileParallelism: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.test.ts',
        '**/*.spec.ts',
        '**/*.d.ts',
      ],
    },
  },
});
