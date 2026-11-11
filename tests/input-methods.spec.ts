
import { test, expect } from '@playwright/test';

test('Demonstrate different Playwright input methods', async ({ page }) => {

  // Open SauceDemo
  await page.goto('https://www.saucedemo.com/');

  // Method 1: fill() - Enter username directly
  await page.locator("//input[@data-test='username']")
    .fill('standard_user');

  // Method 2: pressSequentially() - Type password character by character
  await page.locator("//input[@data-test='password']")
    .pressSequentially('secret_sauce');

  // Method 3: press('Enter') - Press the Enter key
  await page.locator("//input[@data-test='password']")
    .press('Enter');

  // Verify successful login
  await expect(page).toHaveURL(/inventory\.html/);

  console.log('Login successful using different input methods!');
});
