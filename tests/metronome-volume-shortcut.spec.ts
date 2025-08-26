import { test, expect } from '@playwright/test';

test.beforeEach(async ({ context }) => {
  await context.addInitScript(() => {
    window.localStorage.clear();
    window.localStorage.setItem('jaireal.showSecondary', 'true');
    window.localStorage.setItem('jaireal.metronomeVolume', '0.5');
  });
});

test('adjust metronome volume with keyboard shortcuts', async ({ page }) => {
  await page.goto('/');
  await page.click('body');
  const volInput = page.locator('label:has-text("Volumen metrónomo") input');
  await expect(volInput).toHaveValue('0.5');
  await page.keyboard.press('Control+Shift+ArrowUp');
  await expect(volInput).toHaveValue('0.6');
  await page.keyboard.press('Control+Shift+ArrowDown');
  await expect(volInput).toHaveValue('0.5');
});
