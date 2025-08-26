import { test, expect } from '@playwright/test';

test('homepage has header', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('header')).toHaveText('JaiReal-PRO');
});
