import { expect, Page } from '@playwright/test';

interface AssertParams {
  /** URL of the page. */
  url?: string;
  /** Value of document.title. */
  title?: string;
  /** Value of the app's main header (h1). */
  heading?: string;
}

/**
 * Shorthand method for common assertions.
 */
export async function assert(page: Page, params: AssertParams) {
  if (params.heading) {
    const heading = page.locator('h1');
    expect(await heading.textContent()).toStrictEqual(params.heading);
  }

  if (params.title) {
    expect(await page.title()).toStrictEqual(params.title);
  }

  if (params.url) {
    expect(page.url()).toStrictEqual(params.url);
  }
}
