import { test, expect } from '@playwright/test';

test.beforeEach(async ({ context }) => {
  await context.addInitScript(() => {
    window.localStorage.clear();
    window.localStorage.setItem('jaireal.showSecondary', 'true');
    window.localStorage.setItem(
      'jaireal.chart',
      JSON.stringify({
        schemaVersion: 1,
        title: 't',
        sections: [
          {
            name: 'A',
            measures: [
              {
                beats: [
                  { chord: 'C' },
                  { chord: '' },
                  { chord: '' },
                  { chord: '' },
                ],
              },
            ],
          },
        ],
      }),
    );
  });
});

test('transpose with keyboard shortcuts', async ({ page }) => {
  await page.goto('/');
  await page.click('body');
  const chord = page.locator('.chord').first();
  await expect(chord).toHaveText('C');
  await page.keyboard.press('Control+ArrowUp');
  await expect(chord).toHaveText('C#');
  await expect(page.locator('text=Transposición: +1')).toBeVisible();
  await page.keyboard.press('Control+ArrowDown');
  await expect(chord).toHaveText('C');
  await expect(page.locator('text=Transposición: 0')).toBeVisible();
});
