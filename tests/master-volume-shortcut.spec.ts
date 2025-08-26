import { test, expect } from '@playwright/test';

test.beforeEach(async ({ context }) => {
  await context.addInitScript(() => {
    window.localStorage.clear();
    window.localStorage.setItem('jaireal.showSecondary', 'true');
    window.localStorage.setItem('jaireal.masterVolume', '0.5');
  });
});

test('adjust master volume with keyboard shortcuts', async ({ page }) => {
  await page.goto('/');
  await page.click('body');
  const volLabel = page.locator('label:has-text("Volumen (Alt+Shift+↑/↓)")');
  await expect(volLabel).toBeVisible();
  const volInput = volLabel.locator('input');
  await expect(volInput).toHaveValue('0.5');
  await page.keyboard.press('Alt+Shift+ArrowUp');
  await expect(volInput).toHaveValue('0.6');
  await page.keyboard.press('Alt+Shift+ArrowDown');
  await expect(volInput).toHaveValue('0.5');
});
