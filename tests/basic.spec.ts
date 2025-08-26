import { test, expect } from '@playwright/test';

test.beforeEach(async ({ context }) => {
  await context.addInitScript(() => {
    window.localStorage.clear();
    window.localStorage.setItem('jaireal.showSecondary', 'true');
  });
});

test('homepage has header', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('header')).toHaveText('JaiReal-PRO');
});

test('measure has four editable slots', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.measure .slot')).toHaveCount(4);
  await expect(page.locator('.measure .chord').first()).toHaveAttribute(
    'contenteditable',
    'true',
  );
});

test('toggle secondary line with keyboard shortcut', async ({ page }) => {
  await page.goto('/');
  await page.click('body');
  const secondary = page.locator('.secondary').first();
  await expect(secondary).toHaveCSS('display', 'block');
  await page.keyboard.press('Control+Shift+L');
  await expect(secondary).toHaveCSS('display', 'none');
  await page.keyboard.press('Control+Shift+L');
  await expect(secondary).toHaveCSS('display', 'block');
});
