import { test, expect } from '@playwright/test';

test.beforeEach(async ({ context }) => {
  await context.addInitScript(() => {
    window.localStorage.clear();
    window.localStorage.setItem('jaireal.showSecondary', 'true');
    window.localStorage.setItem('jaireal.masterVolume', '0.5');
  });
});

test('reset master volume with keyboard shortcut', async ({ page }) => {
  await page.goto('/');
  await page.click('body');
  const volLabel = page.locator('label:has-text("Volumen (Alt+Shift")');
  const volInput = volLabel.locator('input');
  await expect(volInput).toHaveValue('0.5');
  await page.keyboard.press('Alt+Shift+0');
  await expect(volInput).toHaveValue('1');
});
