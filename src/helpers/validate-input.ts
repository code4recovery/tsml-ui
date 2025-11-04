import { defaults } from '../hooks/settings';
import { formatSearch } from './format-search';

export const validateInput = (
  params: URLSearchParams,
  settings: TSMLReactConfig
): TSMLReactConfig['defaults'] => {
  const { defaults: defaultInput } = settings;

  const modeParam = params.get('mode');
  const mode = isMode(modeParam) ? modeParam : defaultInput.mode;

  const viewParam = params.get('view');
  const view = isView(viewParam) ? viewParam : defaultInput.view;

  const search = formatSearch(
    params.get('search')?.toString() ?? defaultInput.search
  );

  const region = params.has('region')
    ? `${params.get('region')}`.split('/')
    : defaultInput.region;

  const time = params.has('time')
    ? (`${params.get('time')}`.split('/') as Array<
        'morning' | 'midday' | 'evening' | 'night' | 'appointment'
      >)
    : defaultInput.time;

  let weekday = params.has('weekday')
    ? `${params.get('weekday')}`.split('/')
    : defaultInput.weekday;

  if (weekday.includes('today')) {
    const weekdays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const today = weekdays[new Date().getDay()];
    weekday = weekday.map(day => day === 'today' ? today : day);
  }

  const type = params.has('type')
    ? `${params.get('type')}`.split('/')
    : defaultInput.type;

  const meeting = params.get('meeting') ?? defaultInput.meeting;

  const distance = params.has('distance')
    ? parseInt(params.get('distance') ?? '')
    : defaultInput.distance;

  return {
    distance,
    meeting,
    mode,
    region,
    search,
    time,
    type,
    view,
    weekday,
  };
};

const isMode = (mode: string | null): mode is Mode =>
  defaults.modes.includes(mode as Mode);

const isView = (view: string | null): view is View =>
  defaults.views.includes(view as View);
