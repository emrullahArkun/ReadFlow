import { expect, test } from '@playwright/test';
import { installApiMocks, seedAuthenticatedUser, useEnglishLocale } from './support/mockApi';

test('redirects anonymous users from protected routes to login', async ({ page }) => {
    await useEnglishLocale(page);

    await page.goto('/stats');

    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible();
});

test('register flow returns to login page', async ({ page }) => {
    await useEnglishLocale(page);
    await installApiMocks(page);

    await page.goto('/register');

    await page.getByLabel('Email').fill('reader@example.com');
    await page.getByLabel('Password', { exact: true }).fill('Password1234');
    await page.getByLabel('Confirm Password').fill('Password1234');
    await page.getByRole('button', { name: 'Register' }).click();

    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible();
});

test('login flow lands on the home dashboard', async ({ page }) => {
    await useEnglishLocale(page);
    await installApiMocks(page);

    await page.goto('/login');

    await page.getByLabel('Email').fill('reader@example.com');
    await page.getByLabel('Password', { exact: true }).fill('password');
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page).toHaveURL('/');
    await expect(page.getByText('Start with the book that already matters.')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Deep Work', exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: 'My Goals' })).toBeVisible();
});

test('authenticated user can open stats overview', async ({ page }) => {
    await useEnglishLocale(page);
    await seedAuthenticatedUser(page);
    await installApiMocks(page, { authenticated: true });

    await page.goto('/stats');

    await expect(page).toHaveURL('/stats');
    await expect(page.getByText('See the reading rhythm that is actually working.')).toBeVisible();
    await expect(page.getByText('Weekly Momentum')).toBeVisible();
    await expect(page.getByText('Library Progress')).toBeVisible();
});
