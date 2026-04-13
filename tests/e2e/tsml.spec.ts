import { test, expect, type Page } from '@playwright/test';

const MEETINGS = [
  {
    slug: 'monday-morning-group',
    name: 'Monday Morning Group',
    day: 1,
    time: '09:00',
    timezone: 'America/New_York',
    formatted_address: '1 Water St, Vineyard Haven, MA 02568, USA',
    location: 'Steamship Terminal',
    regions: ['Martha\'s Vineyard'],
    types: ['O'],
  },
  {
    slug: 'wednesday-evening-group',
    name: 'Wednesday Evening Group',
    day: 3,
    time: '19:00',
    timezone: 'America/New_York',
    formatted_address: '188 Meeting St, Charleston, SC 29401, USA',
    location: 'City Market',
    regions: ['Charleston'],
    types: ['C'],
  },
  {
    slug: 'friday-online-group',
    name: 'Friday Online Group',
    day: 5,
    time: '20:00',
    timezone: 'America/Los_Angeles',
    conference_url: 'https://zoom.us/j/999000999',
    formatted_address: 'Online',
    regions: ['Remote'],
    types: ['O'],
  },
];

async function mockApi(page: Page) {
  await page.route('http://tsml.e2e.test/**', route =>
    route.fulfill({ json: MEETINGS })
  );
}

async function loadApp(page: Page) {
  await mockApi(page);
  await page.goto('/tests/e2e/fixture.html');
  // Wait until at least one meeting row is visible
  await expect(
    page.getByRole('cell', { name: 'Monday Morning Group', exact: true })
  ).toBeVisible({ timeout: 15000 });
}

const meetingCell = (page: Page, name: string) => page.getByRole('cell', { name, exact: true });

test.describe('meeting list', () => {
  test('renders all meetings from the API', async ({ page }) => {
    await loadApp(page);
    await expect(meetingCell(page, 'Monday Morning Group')).toBeVisible();
    await expect(meetingCell(page, 'Wednesday Evening Group')).toBeVisible();
    await expect(meetingCell(page, 'Friday Online Group')).toBeVisible();
  });

  test('search filters meetings by name', async ({ page }) => {
    await loadApp(page);
    await page.getByRole('searchbox').fill('wednesday');
    // Wait for exactly 1 name cell, confirms filter fully applied before checking negatives
    await expect(page.locator('td.tsml-name')).toHaveCount(1);
    await expect(meetingCell(page, 'Wednesday Evening Group')).toBeVisible();
    await expect(meetingCell(page, 'Monday Morning Group')).not.toBeVisible();
    await expect(meetingCell(page, 'Friday Online Group')).not.toBeVisible();
  });
});

test.describe('meeting detail', () => {
  test('clicking a meeting opens the detail view', async ({ page }) => {
    await loadApp(page);
    await meetingCell(page, 'Monday Morning Group').click();
    await expect(
      page.getByRole('link', { name: 'Back to Meetings' })
    ).toBeVisible();
    await expect(page.getByText('Monday Morning Group')).toBeVisible();
  });

  test('navigating directly to a meeting slug loads the detail view', async ({
    page,
  }) => {
    await mockApi(page);
    await page.goto('/tests/e2e/fixture.html#/wednesday-evening-group');
    await expect(
      page.getByRole('link', { name: 'Back to Meetings' })
    ).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('Wednesday Evening Group')).toBeVisible();
  });
});
