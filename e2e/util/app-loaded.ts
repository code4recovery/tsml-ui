import { Page } from '@playwright/test';

/**
 * A very brittle way to determine if the app has rendered (for now).
 */
export async function appLoaded(page: Page) {
  await page.waitForSelector('.tsml-ui:has(.container-fluid)');
}
