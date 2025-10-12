// format an internal link with correct query params
export function formatUrl(
  input: Partial<TSMLReactConfig['defaults']>,
  settings: TSMLReactConfig,
  includeDomain = false
) {
  const queryString = formatQueryString(input, settings);

  const base = includeDomain ? `${window.location.origin}` : '';

  const [path] = window.location.pathname.split('?');

  return `${base}${path}${queryString}`;
}

// create a query string with only values in use
export function formatQueryString(
  input: Partial<TSMLReactConfig['defaults']>,
  settings: TSMLReactConfig
) {
  const query = {};

  // region, time, type, and weekday
  settings.filters
    .filter(filter => typeof input[filter] !== 'undefined')
    .filter(filter => input[filter]?.length)
    .forEach(filter => {
      // @ts-expect-error TODO
      query[filter] = input[filter].join('/');
    });

  // distance
  if (typeof input.distance !== 'undefined') {
    // @ts-expect-error TODO
    query.distance = input.distance.toString();
  }

  // meeting, mode, search, view
  settings.params
    .filter(param => typeof input[param] !== 'undefined')
    .filter(param => input[param] !== settings.defaults[param])
    .forEach(param => {
      // @ts-expect-error TODO
      query[param] = input[param];
    });

  // create a query string with only values in use
  const queryString = new URLSearchParams(query)
    .toString()
    .replace(/%2F/g, '/')
    .replace(/%20/g, '+')
    .replace(/%2C/g, ',')
    .toString();

  if (!queryString.length) {
    return '';
  }

  return `?${queryString}`;
}
