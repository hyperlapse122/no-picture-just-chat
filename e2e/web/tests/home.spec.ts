import { test, expect } from '@playwright/test';

test('home page shows SSR greeting in initial HTML', async ({ page }) => {
  const response = await page.goto('/');
  expect(response?.status()).toBe(200);

  const greeting = page.getByTestId('home-greeting');
  await expect(greeting).toBeVisible();
  await expect(greeting).toHaveText('hello qa');
});
