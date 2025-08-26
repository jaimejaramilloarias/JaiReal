import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => {
    window.localStorage.setItem('jaireal.showSecondary', 'true');
  });
  await page.reload();
});

test('toggle theme persists', async ({ page }) => {
  await page.goto('/');
  const btn = page.getByRole('button', { name: /tema/i });
  const initial = await page.evaluate(() =>
    localStorage.getItem('jaireal.theme'),
  );
  await btn.click();
  await page.waitForFunction(
    (prev) => localStorage.getItem('jaireal.theme') !== prev,
    initial,
  );
  const toggled = await page.evaluate(() =>
    localStorage.getItem('jaireal.theme'),
  );
  await page.reload();
  const persisted = await page.evaluate(() =>
    localStorage.getItem('jaireal.theme'),
  );
  expect(persisted).toBe(toggled);
});

test('auto-detects system theme', async ({ page }) => {
  await page.evaluate(() => localStorage.removeItem('jaireal.theme'));
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.reload();
  const body = page.locator('body');
  await expect(body).toHaveClass(/dark/);
  await page.emulateMedia({ colorScheme: 'light' });
  await expect(body).not.toHaveClass(/dark/);
});

test('prefer accidentals selection persists', async ({ page }) => {
  await page.goto('/');
  const select = page.locator('#accidental-select');
  await expect(select).toHaveValue('sharp');
  await select.selectOption('flat');
  await expect(select).toHaveValue('flat');
  await page.reload();
  const selectReload = page.locator('#accidental-select');
  await expect(selectReload).toHaveValue('flat');
});
