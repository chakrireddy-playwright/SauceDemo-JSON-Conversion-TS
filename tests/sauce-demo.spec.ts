
import { test, expect, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import path from 'node:path';

// Define the structure of each JSON step
type JsonStep = {
  step_name: string;
  step_script: string;
  label?: string;
  locators?: string[];
  value?: string;
};

// Read the original JSON file
const jsonPath = path.join(
  process.cwd(),
  'test-data',
  'sauce_demo.json'
);

const testData = JSON.parse(
  readFileSync(jsonPath, 'utf-8')
);

const steps: JsonStep[] = testData.scripts[0].steps;

// Validate all five XPath alternatives for an element
async function validateLocators(
  page: Page,
  step: JsonStep
) {
  for (const xpath of step.locators ?? []) {
    const locator = page.locator(`xpath=${xpath}`);

    await expect(
      locator,
      `XPath should identify exactly one element: ${xpath}`
    ).toHaveCount(1);
  }
}

// Execute the actions defined in the JSON
test('SauceDemo automation from JSON', async ({ page }) => {

  for (const [index, step] of steps.entries()) {

    await test.step(
      `${index + 1}. ${step.step_name}`,
      async () => {

        // Step 1: Browser is already launched by Playwright
        if (step.step_script.includes('openBrowser')) {
          console.log('Chrome browser launched by Playwright');
        }

        // Step 2: Navigate to application
        else if (step.step_script.includes('navigateToURL')) {
          const match = step.step_script.match(
            /navigateToURL\('([^']+)'\)/
          );

          expect(match).not.toBeNull();

          await page.goto(match![1]);
        }

        // Validate all supplied XPath alternatives
        else if (
          step.step_script.includes('enterText') ||
          step.step_script.includes('clickElement')
        ) {
          await validateLocators(page, step);

          // Enter text into an element
          if (step.step_script.includes('enterText')) {
            const match = step.step_script.match(
              /enterText\('xpath','(.*?)','(.*?)'\)/
            );

            expect(match).not.toBeNull();

            const [, xpath, value] = match!;

            await page.locator(`xpath=${xpath}`).fill(value);
          }

          // Click an element
          else {
            const match = step.step_script.match(
              /clickElement\('xpath','(.*?)'\)/
            );

            expect(match).not.toBeNull();

            const [, xpath] = match!;

            await page.locator(`xpath=${xpath}`).click();
          }
        }

        // Additional checks after important actions
        if (step.label === 'login-button') {
          await expect(page).toHaveURL(/inventory\.html/);
        }

        if (step.label === 'shopping-cart-badge') {
          await expect(page).toHaveURL(/cart\.html/);
        }

        if (step.label === 'Finish') {
          await expect(
            page.getByText('Thank you for your order!')
          ).toBeVisible();
        }

        // Step 14: Playwright automatically closes the browser
        if (step.step_script.includes('closeBrowser')) {
          console.log('Browser will close after the test');
        }
      }
    );
  }
});
