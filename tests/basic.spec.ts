import { test, expect } from '@playwright/test';

test('homepage has header', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('header')).toHaveText('JaiReal-PRO');
});

test('measure has four editable slots', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.measure .slot')).toHaveCount(4);
  await expect(page.locator('.measure .slot').first()).toHaveAttribute(
    'contenteditable',
    'true',
  );
});
