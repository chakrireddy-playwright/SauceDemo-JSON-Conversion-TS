
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',

  fullyParallel: false,
  workers: 1,
  maxFailures: 1,

  reporter: 'html',

  use: {
    ...devices['Desktop Chrome'],
    channel: 'chrome',
    headless: false,
    screenshot: 'only-on-failure',
    launchOptions: {
      slowMo: 1000,
    },
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chrome',
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
        headless: false,
      },
    },
  ],
});
