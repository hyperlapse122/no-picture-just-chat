import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/login');
  await page.getByTestId('login-email').fill('qa-bot@example.test');
  await page.getByTestId('login-password').fill('QaBot!2026Pass');
  await page.getByTestId('login-submit').click();
  await page.waitForURL('/app');
});

test('app form submits and shows result', async ({ page }) => {
  await expect(page.getByTestId('app-form')).toBeVisible();

  await page.getByTestId('app-form-label').fill('QA item');
  await page.getByTestId('app-form-submit').click();

  const result = page.getByTestId('app-form-result');
  await expect(result).toBeVisible();
  await expect(result).toHaveText('QA item');
});

test('sign out button redirects to login', async ({ page }) => {
  await page.getByTestId('signout-btn').click();
  await page.waitForURL('/login');
  await expect(page).toHaveURL('/login');
});
