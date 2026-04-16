import fs from 'node:fs';
import path from 'node:path';
import { test } from '@playwright/test';

const widths = [320, 360, 375, 414, 768, 1024, 1280, 1440];
const outputDir = path.join(process.cwd(), 'playwright', 'screenshots');

function ensureOutputDir() {
  fs.mkdirSync(outputDir, { recursive: true });
}

test.describe('responsive snapshots', () => {
  test('home and login across widths', async ({ page }) => {
    ensureOutputDir();

    for (const width of widths) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/', { waitUntil: 'networkidle' });
      await page.waitForTimeout(300);
      await page.screenshot({
        path: path.join(outputDir, `home-${width}.png`),
        fullPage: true,
      });

      const signIn = page.getByRole('button', { name: /sign in/i }).first();
      await signIn.click();
      await page.waitForTimeout(300);
      await page.screenshot({
        path: path.join(outputDir, `login-${width}.png`),
        fullPage: true,
      });
    }
  });
});
