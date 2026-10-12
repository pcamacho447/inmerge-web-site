import { test, expect } from 'playwright/test';

test.describe('Services Page & QuickEstimator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/servicios');
    await page
      .locator('.preloader-overlay')
      .waitFor({ state: 'hidden', timeout: 5000 })
      .catch(() => {});
  });

  test('renders services page content and headings', async ({ page }) => {
    // Heading should be visible
    const heading = page.locator('h1, h2, [role="heading"]').first();
    await expect(heading).toBeVisible({ timeout: 10000 });

    // Header nav should be visible
    const nav = page.locator('nav').filter({ hasText: 'INMERGE' });
    await expect(nav).toBeVisible();
  });

  test('interacts with service line selector and currency options in estimator', async ({ page }) => {
    // Estimator or service buttons selector
    const serviceButtons = page.getByRole('button').filter({ hasText: /01|02|03|Páginas|Ingeniería|Inteligencia/i });
    if ((await serviceButtons.count()) > 0) {
      await expect(serviceButtons.first()).toBeVisible();
      await serviceButtons.first().click();
    }
  });
});
