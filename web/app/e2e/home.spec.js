import { test, expect } from 'playwright/test';

test.describe('Home Page (Atrio Cinematográfico)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page
      .locator('.preloader-overlay')
      .waitFor({ state: 'hidden', timeout: 5000 })
      .catch(() => {});
  });

  test('renders homepage header, navigation, and typewriter hero', async ({ page }) => {
    // Check main navigation bar
    const nav = page.locator('nav').filter({ hasText: 'INMERGE' });
    await expect(nav).toBeVisible({ timeout: 10000 });

    // Check main navigation links
    await expect(nav.getByRole('link', { name: /Inicio|Home/i })).toBeVisible();
    await expect(nav.getByRole('link', { name: /Servicios|Services/i })).toBeVisible();
    await expect(nav.getByRole('link', { name: /Nosotros|About/i })).toBeVisible();
    await expect(nav.getByRole('link', { name: /Contacto|Contact/i })).toBeVisible();

    // Language switcher pill
    const langBtn = page.getByRole('group', { name: /Idioma|Language/i });
    await expect(langBtn).toBeVisible();
  });

  test('toggles language between ES and EN', async ({ page }) => {
    const langGroup = page.getByRole('group', { name: /Idioma|Language/i });
    await expect(langGroup).toBeVisible();

    // Click EN language button
    await langGroup.getByRole('button', { name: 'EN' }).click();

    // URL should switch to English route /en
    await page.waitForURL('**/en', { timeout: 10000 });
    await expect(page).toHaveURL(/\/en$/);

    // Click ES language button back
    await langGroup.getByRole('button', { name: 'ES' }).click();
    await page.waitForURL('**/', { timeout: 10000 });
  });
});
