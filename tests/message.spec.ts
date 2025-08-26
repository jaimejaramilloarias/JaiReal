import { test, expect } from '@playwright/test';

test('close marker validation message manually', async ({ page }) => {
  await page.goto('/');
  // Select first measure to enable marker selection
  await page.click('.measure');
  const markerSelect = page.getByLabel('Marcador:');
  await markerSelect.focus();
  // Choose an invalid marker (Fine requiere D.C. o D.S.)
  await markerSelect.selectOption('Fine');
  const message = page.locator('.message');
  await expect(message).toBeVisible();
  await expect(message).toContainText('Fine requiere D.C. o D.S.');
  await expect(message).toBeFocused();
  await expect(message).toHaveAttribute('role', 'alert');
  await expect(message).toHaveAttribute('aria-live', 'assertive');
  await page.click('.message-close');
  await expect(message).toBeHidden();
  await expect(markerSelect).toBeFocused();
});
