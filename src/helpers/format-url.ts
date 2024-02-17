// format an internal link with correct query params
export function formatUrl({
  input,
  meeting,
  settings,
}: {
  input: Partial<TSMLReactConfig['defaults']>;
  meeting?: string;
  settings: TSMLReactConfig;
}) {
  const query = {};

  // distance, region, time, type, and weekday
  settings.filters
    .filter(filter => typeof input[filter] !== 'undefined')
    .filter(filter => input[filter]?.length)
    .forEach(filter => {
      // @ts-expect-error TODO
      query[filter] = input[filter].join('/');
    });

  // meeting, mode, search, view
  settings.params
    .filter(param => typeof input[param] !== 'undefined')
    .filter(param => input[param] !== settings.defaults[param])
    .forEach(param => {
      // @ts-expect-error TODO
      query[param] = input[param];
    });

  if (!settings.path) {
    // @ts-expect-error TODO
    query.meeting = meeting;
  } else if (!meeting) {
    // @ts-expect-error TODO
    delete query.meeting;
  }

  // create a query string with only values in use
  const queryString = new URLSearchParams(query)
    .toString()
    .replace(/%2F/g, '/')
    .replace(/%20/g, '+')
    .replace(/%2C/g, ',');

  const path = settings.path
    ? `${settings.path}${meeting ? `/${meeting}` : ''}`
    : window.location.href.split('?')[0];

  return `${path}${queryString.length ? `?${queryString}` : ''}`;
}
