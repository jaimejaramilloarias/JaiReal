import { test, expect } from '@playwright/test';

test.beforeEach(async ({ context }) => {
  await context.addInitScript(() => {
    window.localStorage.clear();
    window.localStorage.setItem('jaireal.showSecondary', 'true');
    window.localStorage.setItem('jaireal.tempo', '120');
  });
});

test('adjust tempo with mouse wheel', async ({ page }) => {
  await page.goto('/');
  const tempoLabel = page.locator('label:has-text("Tempo (Ctrl+←/→, rueda)")');
  const tempoInput = tempoLabel.locator('input');
  await expect(tempoInput).toHaveValue('120');
  await tempoInput.dispatchEvent('wheel', { deltaY: -100 });
  await expect(tempoInput).toHaveValue('121');
  await tempoInput.dispatchEvent('wheel', { deltaY: 100 });
  await expect(tempoInput).toHaveValue('120');
});
