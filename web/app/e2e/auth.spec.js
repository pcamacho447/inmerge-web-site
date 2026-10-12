import { test, expect } from 'playwright/test';

test.describe('Auth Pages (Login & Register)', () => {
  test('renders login page with autocomplete attributes', async ({ page }) => {
    await page.goto('/login');
    await page
      .locator('.preloader-overlay')
      .waitFor({ state: 'hidden', timeout: 5000 })
      .catch(() => {});

    const heading = page.locator('h1, h2, [role="heading"]').first();
    await expect(heading).toBeVisible({ timeout: 10000 });

    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeVisible();
    await expect(emailInput).toHaveAttribute('autocomplete', 'username');

    const passwordInput = page.locator('input[type="password"]');
    await expect(passwordInput).toBeVisible();
    await expect(passwordInput).toHaveAttribute('autocomplete', 'current-password');
  });

  test('renders registration page with B2B inputs', async ({ page }) => {
    await page.goto('/registro');
    await page
      .locator('.preloader-overlay')
      .waitFor({ state: 'hidden', timeout: 5000 })
      .catch(() => {});

    const heading = page.locator('h1, h2, [role="heading"]').first();
    await expect(heading).toBeVisible({ timeout: 10000 });

    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeVisible();

    const passwordInput = page.locator('input[type="password"]');
    await expect(passwordInput).toBeVisible();
    await expect(passwordInput).toHaveAttribute('autocomplete', 'new-password');
  });
});
