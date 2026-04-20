import { test, expect } from '@playwright/test';

test('login page has required form fields', async ({ page }) => {
  await page.goto('/login');

  await expect(page.getByTestId('login-email')).toBeVisible();
  await expect(page.getByTestId('login-password')).toBeVisible();
  await expect(page.getByTestId('login-submit')).toBeVisible();
});

test('login with valid credentials redirects to /app', async ({ page }) => {
  await page.goto('/login');

  await page.getByTestId('login-email').fill('qa-bot@example.test');
  await page.getByTestId('login-password').fill('QaBot!2026Pass');
  await page.getByTestId('login-submit').click();

  await page.waitForURL('/app');
  await expect(page).toHaveURL('/app');
});
