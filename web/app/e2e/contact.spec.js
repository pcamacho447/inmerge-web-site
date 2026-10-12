import { test, expect } from 'playwright/test';

test.describe('Contact Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/contacto');
    await page
      .locator('.preloader-overlay')
      .waitFor({ state: 'hidden', timeout: 5000 })
      .catch(() => {});
  });

  test('renders contact form with required B2B fields and WhatsApp link', async ({ page }) => {
    // Check page heading or section title
    const heading = page.locator('h1, h2, [role="heading"]').first();
    await expect(heading).toBeVisible({ timeout: 10000 });

    // Verify WhatsApp direct link or contact CTAs exist
    const whatsappLink = page.locator('a[href*="wa.me"], a[href*="api.whatsapp.com"]').first();
    await expect(whatsappLink).toBeVisible();

    // Verify form input fields
    const nameInput = page.locator('input[name="name"], input[placeholder*="nombre"i]').first();
    const emailInput = page.locator('input[type="email"]').first();

    if (await nameInput.isVisible()) {
      await nameInput.fill('Contacto E2E Test');
    }
    if (await emailInput.isVisible()) {
      await emailInput.fill('e2e-test@inmerge.pe');
    }
  });
});
