import { test, expect } from '@playwright/test';
import { baseUrl, appLoaded } from '../util';

test.beforeEach(async ({ page }) => {
  await page.goto(baseUrl({ query: { view: 'map' } }));
  await appLoaded(page);
});

test.describe('Map', () => {
  test('popup', async ({ page }) => {
    try {
      //Brittle, but the marker has to be one that isn't overlapped by another.
      const marker = page.locator('div[title="Redwood Estates Pavilion"]');

      const popup = page.locator('.mapboxgl-popup');
      const header = popup.locator('h4');
      const description = popup.locator('p');
      const directions = popup.locator('a:has-text("Get Directions")');

      const meeting = popup.locator('.list-group-item').first();
      const meetingTime = meeting.locator('time');
      const meetingLink = meeting.locator('a');

      const closeButton = popup.locator('.mapboxgl-popup-close-button');

      //Open popup
      await marker.click();

      await expect(popup).toBeVisible();

      await expect(header).toHaveText('Redwood Estates Pavilion');
      await expect(description).toHaveText(
        '21450 Madrone Dr, Los Gatos, CA 95033, USA'
      );
      await expect(directions).toHaveAttribute('target', '_blank');
      await expect(directions).toHaveAttribute(
        'href',
        'https://www.google.com/maps?saddr=Current+Location&daddr=37.1577738%2C-121.984212&q=21450+Madrone+Dr%2C+Los+Gatos%2C+CA+95033%2C+USA'
      );

      await expect(meetingTime).toHaveText('7:30 pmThursday');
      await expect(meetingLink).toHaveText('Mountain Miracles');
      await expect(meetingLink).toHaveAttribute(
        'href',
        /view=map&meeting=mountain-miracles/
      );

      //Close popup
      await closeButton.click();

      await expect(popup).not.toBeVisible();
    } catch (err) {
      console.error(err);
    }
  });
});
