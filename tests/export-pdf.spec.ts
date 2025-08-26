import { test, expect } from '@playwright/test';

test.beforeEach(async ({ context }) => {
  await context.addInitScript(() => {
    window.localStorage.clear();
    window.localStorage.setItem('jaireal.showSecondary', 'true');
  });
});

test('export chart to PDF', async ({ page }) => {
  await page.goto('/');
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.click('text=Exportar PDF'),
  ]);
  expect(download.suggestedFilename()).toBe('chart.pdf');
});
