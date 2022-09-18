import { stringify } from 'qs';
import config from '../../playwright.config';

export type BaseUrlInput =
  | string
  | {
      query?: Record<string, string | number>;
      path?: string;
    };

/**
 * Returns playwright's base url from the config and
 * adds the ability to append paths and/or query params.
 */
export function baseUrl(input?: BaseUrlInput): string {
  let url = config.use.baseURL;

  if (typeof input === 'string') {
    return (url += input);
  }

  if (input?.path) {
    url += input.path;
  }

  if (input?.query) {
    url += stringify(input.query, { addQueryPrefix: true });
  }

  return url;
}
