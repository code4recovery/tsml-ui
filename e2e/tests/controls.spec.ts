import { test, Page } from '@playwright/test';
import { baseUrl, selectors, assert, appLoaded } from '../util';

test.beforeEach(async ({ page }) => {
  await page.goto(baseUrl());
  await appLoaded(page);
  await assertDefaults(page);
});

test.describe('Controls', () => {
  test('searchbox', async ({ page }) => {
    const { controls } = selectors(page);

    await controls.searchbox.type('z');

    await assert(page, {
      heading: 'Meetings with ‘z’',
      title: 'Meetings with ‘z’',
      url: baseUrl({ query: { search: 'z' } }),
    });

    await controls.searchbox.press('Backspace');

    await assertDefaults(page);
  });

  test('mode dropdown', async ({ page }) => {
    const { controls } = selectors(page);

    const menu = page.locator('.dropdown-menu.show');
    const nearMeLink = menu.locator('text=Near Me');
    const nearLocationLink = menu.locator('text=Near Location');

    await controls.dropdowns.mode.click();
    await nearMeLink.click();

    await assert(page, {
      url: baseUrl({ query: { mode: 'me' } }),
    });

    await controls.dropdowns.mode.click();
    await nearLocationLink.click();

    await controls.searchbox.type('z');
    await controls.searchbox.press('Enter');

    await assert(page, {
      heading: 'Meetings near ‘z’',
      title: 'Meetings near ‘z’',
      url: baseUrl({ query: { search: 'z', mode: 'location' } }),
    });

    await controls.searchbox.press('Backspace');
    await controls.searchbox.press('Enter');

    await assert(page, {
      heading: 'Meetings',
      title: 'Meetings',
      url: baseUrl({ query: { mode: 'location' } }),
    });
  });

  test('region dropdown', async ({ page }) => {
    const { controls } = selectors(page);

    const menu = page.locator('.dropdown-menu.show');
    const regionLink = menu.locator('text=Campbell');
    const anywhereLink = menu.locator('text=Anywhere');

    await controls.dropdowns.region.click();
    await regionLink.click();

    await assert(page, {
      heading: 'Meetings in Campbell',
      title: 'Meetings in Campbell',
      url: baseUrl({ query: { region: 'campbell' } }),
    });

    await controls.dropdowns.region.click();
    await anywhereLink.click();

    await assertDefaults(page);
  });

  test('weekday dropdown', async ({ page }) => {
    const { controls } = selectors(page);

    const menu = page.locator('.dropdown-menu.show');
    const weekdayLink = menu.locator('text=Sunday');
    const anydayLink = menu.locator('text=Any Day');

    await controls.dropdowns.weekday.click();
    await weekdayLink.click();

    await assert(page, {
      heading: 'Sunday Meetings',
      title: 'Sunday Meetings',
      url: baseUrl({ query: { weekday: 0 } }),
    });

    await controls.dropdowns.weekday.click();
    await anydayLink.click();

    await assertDefaults(page);
  });

  test('time dropdown', async ({ page }) => {
    const { controls } = selectors(page);

    const menu = page.locator('.dropdown-menu.show');
    const timeLink = menu.locator('text=Morning');
    const anytimeLink = menu.locator('text=Any Time');

    await controls.dropdowns.time.click();
    await timeLink.click();

    await assert(page, {
      heading: 'Morning Meetings',
      title: 'Morning Meetings',
      url: baseUrl({ query: { time: 'morning' } }),
    });

    await controls.dropdowns.time.click();
    await anytimeLink.click();

    await assertDefaults(page);
  });

  test('type dropdown', async ({ page }) => {
    const { controls } = selectors(page);

    const menu = page.locator('.dropdown-menu.show');
    const typeLink = menu.locator('text=Online');
    const anytypeLink = menu.locator('text=Any Type');

    await controls.dropdowns.type.click();
    await typeLink.click();

    await assert(page, {
      heading: 'Online Meetings',
      title: 'Online Meetings',
      url: baseUrl({ query: { type: 'online' } }),
    });

    await controls.dropdowns.type.click();
    await anytypeLink.click();

    await assertDefaults(page);
  });

  test('view toggler', async ({ page }) => {
    const { controls } = selectors(page);

    const mapButton = controls.viewToggle.locator('button[aria-label=Map]');
    await mapButton.click();

    await assert(page, {
      url: baseUrl({ query: { view: 'map' } }),
    });
  });

  test('combining filters', async ({ page }) => {
    const { controls } = selectors(page);

    const menu = page.locator('.dropdown-menu.show');

    await controls.searchbox.type('z');

    await controls.dropdowns.region.click();
    await menu.locator('text=Campbell').click();

    await controls.dropdowns.weekday.click();
    await menu.locator('text=Sunday').click();

    await controls.dropdowns.time.click();
    await menu.locator('text=Morning').click();

    await controls.dropdowns.type.click();
    await menu.locator('text=Online').click();

    await assert(page, {
      heading: 'Sunday Morning Online Meetings in Campbell with ‘z’',
      title: 'Sunday Morning Online Meetings in Campbell with ‘z’',
      url: baseUrl({
        query: {
          region: 'campbell',
          weekday: 0,
          time: 'morning',
          type: 'online',
          search: 'z',
        },
      }),
    });
  });
});

async function assertDefaults(page: Page) {
  await assert(page, {
    url: baseUrl(),
    title: 'Meetings',
    heading: 'Meetings',
  });
}
