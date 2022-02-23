import { test, expect } from '@playwright/test';
import { baseUrl, assert, appLoaded } from '../util';

test.beforeEach(async ({ page }) => {
  await page.goto(
    baseUrl({ query: { view: 'map', meeting: 'mountain-miracles' } })
  );
  await appLoaded(page);
});

test.describe('Meeting Details', () => {
  test('header', async ({ page }) => {
    const backToMeetingsLink = page.locator('a:has-text("Back to Meetings")');

    await expect(backToMeetingsLink).toHaveAttribute('href', /view=map/);
    await assert(page, { heading: 'Mountain Miracles' });
  });

  test('sidebar top', async ({ page }) => {
    const directionsLink = page.locator('a:has-text("Get Directions")').first();
    const root = page.locator('.list-group .list-group-item').first();

    const time = root.locator('p').first();
    const types = root.locator('ul').first().locator('li');
    const description = root.locator('p').nth(1);
    const emailLink = root.locator('a:has-text("mondabear35@yahoo.com")');
    const venmoLink = root.locator('a:has-text("Contribute with Venmo")');

    await expect(directionsLink).toHaveAttribute('target', '_blank');
    await expect(directionsLink).toHaveAttribute(
      'href',
      'https://www.google.com/maps?saddr=Current+Location&daddr=37.1577738%2C-121.984212&q=21450+Madrone+Dr%2C+Los+Gatos%2C+CA+95033%2C+USA'
    );

    await expect(time).toHaveText('Thursday 7:30 pm – 8:30 pm');

    await expect(await types.allTextContents()).toStrictEqual([
      'Birthday',
      'Digital Basket',
      'Discussion',
      'In-person',
      'Open',
      'Wheelchair Access',
      'Wheelchair-accessible Bathroom',
    ]);
    await expect(description).toHaveText(
      'Chips given on the last Thursday of the month. Take the Redwood Estates exit from Highway 17 and turn right on Madrone Drive. The pavilion is on the right.'
    );

    await expect(emailLink).toHaveAttribute('target', '_blank');
    await expect(emailLink).toHaveAttribute(
      'href',
      'mailto:mondabear35@yahoo.com'
    );

    await expect(venmoLink).toHaveAttribute('target', '_blank');
    await expect(venmoLink).toHaveAttribute(
      'href',
      'https://venmo.com/RedwoodEst-mtg'
    );
  });

  test('sidebar bottom', async ({ page }) => {
    const root = page.locator('.list-group .list-group-item').nth(1);
    const header = root.locator('h2');
    const address = root.locator('p').nth(0);
    const details = root.locator('div');
    const detailsDay = details.locator('h3');
    const detailsInfo = details.locator('ol');

    await expect(header).toHaveText('Redwood Estates Pavilion');
    await expect(address).toHaveText(
      '21450 Madrone Dr, Los Gatos, CA 95033, USA'
    );
    await expect(detailsDay).toHaveText('Thursday');
    await expect(detailsInfo).toHaveText('7:30 pmMountain Miracles');
  });
});
