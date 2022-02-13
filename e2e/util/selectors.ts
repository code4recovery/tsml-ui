import { Page } from '@playwright/test';

class Selectors {
  public page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  public get controls() {
    const root = this.page.locator('div.controls');

    return {
      searchbox: root.locator('input[type=search]'),
      viewToggle: root.locator('div[role=group]:has(button[aria-label=List])'),
      dropdowns: {
        mode: root.locator('button#mode'),
        region: root.locator('button#region'),
        weekday: root.locator('button#weekday'),
        time: root.locator('button#time'),
        type: root.locator('button#type'),
      },
    };
  }
}

/**
 * Provides accessors for common page selectors.
 */
export function selectors(page: Page) {
  return new Selectors(page);
}
