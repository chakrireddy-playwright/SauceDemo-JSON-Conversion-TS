
import { test, expect, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import path from 'node:path';

// Read the original JSON test data
const jsonPath = path.join(
  process.cwd(),
  'test-data',
  'sauce_demo.json'
);

const testData = JSON.parse(
  readFileSync(jsonPath, 'utf-8')
);

// Get all test steps from JSON
const steps = testData.scripts[0].steps;

// Prepare the browser for each element's validation


async function openElementPage(page: Page, label: string) {

  console.log(`DEBUG: Opening page for ${label}`);

  // Open SauceDemo
  await page.goto('https://www.saucedemo.com/');

  // Login page elements
  if (
    ['username', 'password', 'login-button'].includes(label)
  ) {
    return;
  }

  // Login
  await page.locator('#user-name').fill('standard_user');
  await page.locator('#password').fill('secret_sauce');
  await page.locator('#login-button').click();

  await expect(page).toHaveURL(/inventory\.html/);

  await expect(
  page.locator('.inventory_item')
).toHaveCount(6, { timeout: 10000 });

console.log(
  'DEBUG: Product count:',
  await page.locator('.inventory_item').count()
);

  console.log('DEBUG: Login successful');

  console.log('DEBUG: Current URL:', page.url());
console.log('DEBUG: Backpack button count:',
  await page.locator("[data-test='add-to-cart-sauce-labs-backpack']").count()
);
console.log('DEBUG: Page title:', await page.title());


  // Add Backpack to cart
  if (label !== 'Add to cart') {

  const addToCartButton = page.locator(
    "[data-test='add-to-cart-sauce-labs-backpack']"
  );

  const removeButton = page.locator(
    "[data-test='remove-sauce-labs-backpack']"
  );

  if (await addToCartButton.count() === 1) {
    await addToCartButton.click();
    console.log('DEBUG: Backpack added to cart');
  } else {
    await expect(removeButton).toBeVisible();
    console.log('DEBUG: Backpack was already in the cart');
  }

  await expect(
    page.locator("[data-test='shopping-cart-badge']")
  ).toHaveText('1');
}

  // Product page elements
  if (
    ['Add to cart', 'shopping-cart-badge'].includes(label)
  ) {
    return;
  }

  // Navigate directly to Cart page
  await page.goto('https://www.saucedemo.com/cart.html');

  await expect(page).toHaveURL(/cart\.html/);

  console.log('DEBUG: Cart page opened');

  // Checkout button is on Cart page
  if (label === 'Checkout') {
    return;
  }

  // Open Checkout Information page
  await page.locator('[data-test="checkout"]').click();

  await expect(page).toHaveURL(/checkout-step-one\.html/);

  console.log('DEBUG: Checkout information page opened');

  // Prepare Order Overview page for Finish button
  if (label === 'Finish') {

    await page.locator('#first-name').fill('Nagesh');
    await page.locator('#last-name').fill('pva');
    await page.locator('#postal-code').fill('550050');

    await page.locator('#continue').click();

    await expect(page).toHaveURL(/checkout-step-two\.html/);

    console.log('DEBUG: Order overview page opened');
  }
}


// Validate every XPath locator from the JSON
test('Validate all 55 XPath locators from JSON', async ({ page }) => {

  test.setTimeout(120000);

  let totalLocators = 0;

  for (const step of steps) {

    if (!step.locators || step.locators.length === 0) {
      continue;
    }

    await test.step(`Validate ${step.label}`, async () => {

  console.log(`\n========== START: ${step.label} ==========`);

  console.log('DEBUG: Preparing page');
  await openElementPage(page, step.label);

  console.log('DEBUG: Page preparation completed');
  console.log('DEBUG: Current URL:', page.url());

  console.log(`DEBUG: Starting XPath validation for ${step.label}`);

    for (const [index, xpath] of step.locators.entries()) {

  console.log(`Checking ${step.label} - XPath ${index + 1}`);
  console.log(`XPath: ${xpath}`);

  const locator = page.locator(`xpath=${xpath}`);

  await expect(locator).toHaveCount(1, {
    timeout: 5000
  });

  await expect(locator).toBeVisible({
    timeout: 5000
  });

  totalLocators++;

  console.log(
    `${step.label} - XPath ${index + 1}: PASSED`
  );
}

console.log(`DEBUG: Completed XPath validation for ${step.label}`);
    });
  }

  expect(totalLocators).toBe(55);

  console.log(`TOTAL VALIDATED XPATH LOCATORS: ${totalLocators}`);
});
