import { test, expect } from '@playwright/test';

test.beforeEach(async ({ context }) => {
  await context.addInitScript(() => {
    window.localStorage.clear();
  });
});

test('shows octave transpose shortcuts in controls', async ({ page }) => {
  await page.goto('/');
  await expect(
    page.getByRole('button', { name: /Ctrl\+Alt\+↑/ }),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: /Ctrl\+Alt\+↓/ }),
  ).toBeVisible();
});
