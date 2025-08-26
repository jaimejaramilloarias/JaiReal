import { test, expect } from '@playwright/test';

test('close marker validation message manually', async ({ page }) => {
  await page.goto('/');
  // Select first measure to enable marker selection
  await page.click('.measure');
  // Choose an invalid marker (Fine requires D.C. or D.S.)
  await page.selectOption('select', 'Fine');
  const message = page.locator('.message');
  await expect(message).toBeVisible();
  await expect(message).toContainText('Fine requiere D.C. o D.S.');
  await page.click('.message-close');
  await expect(message).toBeHidden();
});
