import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    environment: 'node',

    include: ['**/*.test.ts', '**/*.spec.ts'],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/*.integration.test.ts',
      '**/*.e2e.test.ts',
    ],

    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.test.ts',
        'src/**/*.spec.ts',
        'src/**/*.integration.test.ts',
        'src/**/*.e2e.test.ts',
        'src/types/**',
        'src/**/*.d.ts',
        'src/index.ts',
        'src/bot.ts',
        'src/**/index.ts',
        'src/messaging/adapters/**',
        'src/storage/task-storage.ts',
      ],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 60,
        statements: 70,
      },
    },

    globals: true,

    testTimeout: 10000,
    hookTimeout: 10000,

    isolate: true,

    mockReset: true,
    restoreMocks: true,

    watch: false,

    reporters: process.env.CI ? ['json', 'junit'] : ['verbose'],
  },

  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@tests': resolve(__dirname, './tests'),
    },
  },
});
