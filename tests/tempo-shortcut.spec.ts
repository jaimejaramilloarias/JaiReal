import { test, expect } from '@playwright/test';

test.beforeEach(async ({ context }) => {
  await context.addInitScript(() => {
    window.localStorage.clear();
    window.localStorage.setItem('jaireal.showSecondary', 'true');
    window.localStorage.setItem('jaireal.tempo', '120');
  });
});

test('adjust tempo with keyboard shortcuts', async ({ page }) => {
  await page.goto('/');
  await page.click('body');
  const tempoLabel = page.locator('label:has-text("Tempo (Ctrl+←/→)")');
  await expect(tempoLabel).toBeVisible();
  const tempoInput = tempoLabel.locator('input');
  await expect(tempoInput).toHaveValue('120');
  await page.keyboard.press('Control+ArrowRight');
  await expect(tempoInput).toHaveValue('125');
  await page.keyboard.press('Control+ArrowLeft');
  await expect(tempoInput).toHaveValue('120');
});
