import { test, expect } from '@playwright/test';

test.beforeEach(async ({ context }) => {
  await context.addInitScript(() => {
    window.localStorage.clear();
    window.localStorage.setItem('jaireal.showSecondary', 'true');
    window.localStorage.setItem('jaireal.chordVolume', '0.5');
  });
});

test('adjust chord volume with keyboard shortcuts', async ({ page }) => {
  await page.goto('/');
  await page.click('body');
  const volLabel = page.locator(
    'label:has-text("Volumen acordes (Ctrl+Alt+Shift+↑/↓)")',
  );
  await expect(volLabel).toBeVisible();
  const volInput = volLabel.locator('input');
  await expect(volInput).toHaveValue('0.5');
  await page.keyboard.press('Control+Alt+Shift+ArrowUp');
  await expect(volInput).toHaveValue('0.6');
  await page.keyboard.press('Control+Alt+Shift+ArrowDown');
  await expect(volInput).toHaveValue('0.5');
});
