import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env.local') });
dotenv.config({ path: path.resolve(__dirname, '.env') });

export default defineConfig({
  // Directory containing test files
  testDir: './src/tests',

  // Disable parallel execution at the top level; individual projects override this
  fullyParallel: false,

  // Fail CI if test.only is accidentally left in the code
  forbidOnly: !!process.env.CI,

  // Number of retry attempts for failed tests
  retries: process.env.CI ? 1 : 0,

  // Maximum time a single test can run before timing out (30 seconds)
  timeout: 30 * 1000,

  // Output formats: terminal list + HTML report (without auto-opening) + JSON report
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
    ['json', { outputFile: 'playwright-report/report.json' }],
  ],

  // Shared settings applied to all projects
  use: {
    // Base URL for navigation; falls back to localhost for local development
    baseURL: process.env.BASE_URL ?? 'http://localhost:3002',

    // Record trace only when a test fails for debugging
    trace: 'retain-on-failure',

    // Capture screenshot only when a test fails
    screenshot: 'only-on-failure',

    // Record video only when a test fails
    video: 'retain-on-failure',
  },

  projects: [
    // {
    //   // Market tests that must run sequentially (e.g., order-dependent flows)
    //   name: 'market-serial',
    //   testDir: './src/tests/market',
    //   use: {
    //     ...devices['Desktop Chrome'],
    //     // Required for tests that interact with clipboard
    //     permissions: ['clipboard-read', 'clipboard-write'],
    //   },
    //   // Force sequential execution
    //   fullyParallel: false,
    //   // Single worker ensures strict ordering
    //   workers: 1,
    // },
    // {
    //   // General tests that can run in parallel safely
    //   name: 'general-parallel',
    //   testDir: './src/tests/general',
    //   use: {
    //     ...devices['Desktop Chrome'],
    //     // Required for tests that interact with clipboard
    //     permissions: ['clipboard-read', 'clipboard-write'],
    //   },
    //   // Enable parallel execution for faster runs
    //   fullyParallel: true,
    //   // Limit concurrency to avoid resource contention
    //   workers: 1,
    // },

    // Setup runs first: authenticate, accept terms, save storage state.
    // Must be declared before projects that depend on it.
    {
      name: 'setup',
      testDir: './src/fixtures',
      testMatch: /auth\.setup\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        permissions: ['clipboard-read', 'clipboard-write'],
        viewport: { width: 1920, height: 1080 },
      },
    },
    // All tests (and smoke-only run) depend on setup so auth state is ready.
    {
      name: 'default',
      testDir: './src/tests',
      use: {
        ...devices['Desktop Chrome'],
        permissions: ['clipboard-read', 'clipboard-write'],
        viewport: { width: 1920, height: 1080 },
      },
      fullyParallel: false,
      workers: 1,
      dependencies: ['setup'],
    },
  ],
});
