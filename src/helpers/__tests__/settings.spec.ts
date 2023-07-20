import { mergeSettings } from '../settings';

describe('settings', () => {
  let languageGetter: jest.SpyInstance<string, []>;

  beforeEach(() => {
    languageGetter = jest.spyOn(window.navigator, 'language', 'get');
  });

  it('should import user columns', () => {
    const columns = ['name'];
    const { settings } = mergeSettings({
      columns,
    });
    expect(settings.columns).toEqual(columns);
  });

  it('should import user weekdays', () => {
    const weekdays = [
      'domingo',
      'lunes',
      'martes',
      'miercoles',
      'jueves',
      'viernes',
      'sabado',
    ];
    const { settings } = mergeSettings({ weekdays });
    expect(settings.weekdays).toEqual(weekdays);
  });

  it('should import flags', () => {
    const flags: MeetingType[] = ['O', 'C'];
    const { settings } = mergeSettings({ flags });
    expect(settings.flags).toEqual(flags);
  });

  it('should import empty flags', () => {
    const flags: MeetingType[] = [];
    const { settings } = mergeSettings({ flags });
    expect(settings.flags).toEqual(flags);
  });

  it('should fall back to english', () => {
    languageGetter.mockReturnValue('de');
    const { settings } = mergeSettings();
    expect(settings.language).toEqual('en');
  });
});
