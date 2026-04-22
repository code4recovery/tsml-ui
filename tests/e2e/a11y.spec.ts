import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

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
];

async function mockApi(page: Page) {
  await page.route('http://tsml.e2e.test/**', route =>
    route.fulfill({ json: MEETINGS })
  );
}

async function scan(page: Page) {
  return new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22a', 'wcag22aa'])
    .analyze();
}

test.describe('accessibility', () => {
  test('meeting list view has no detectable a11y violations', async ({ page }) => {
    await mockApi(page);
    await page.goto('/tests/e2e/fixture.html');
    await expect(
      page.getByRole('cell', { name: 'Monday Morning Group', exact: true })
    ).toBeVisible({ timeout: 15000 });

    const { violations } = await scan(page);
    expect(violations).toEqual([]);
  });

  test('meeting detail view has no detectable a11y violations', async ({ page }) => {
    await mockApi(page);
    await page.goto('/tests/e2e/fixture.html#/wednesday-evening-group');
    await expect(
      page.getByRole('link', { name: 'Back to Meetings' })
    ).toBeVisible({ timeout: 15000 });

    const { violations } = await scan(page);
    expect(violations).toEqual([]);
  });
});
