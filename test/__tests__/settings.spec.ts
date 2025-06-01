describe('settings', () => {
  let languageGetter: jest.SpyInstance<string, []>;

  beforeEach(() => {
    languageGetter = jest.spyOn(window.navigator, 'language', 'get');
  });

  it('should import flags', () => {
    const flags = ['O', 'C'];
    // const { settings } = mergeSettings({ flags });
    // expect(settings.flags).toEqual(flags);
  });

  it('should import empty flags', () => {
    const flags: string[] = [];
    // const { settings } = mergeSettings({ flags });
    // expect(settings.flags).toEqual(flags);
  });

  it('should import user columns', () => {
    const columns = ['name'];
    // const { settings } = mergeSettings({
    //   columns,
    // });
    // expect(settings.columns).toEqual(columns);
  });

  it('should import user columns', () => {
    const columns = ['name'];
    // const { settings } = mergeSettings({ columns });
    // expect(settings.columns).toEqual(columns);
  });

  it('should import user filters', () => {
    const filters = ['region'] as TSMLReactConfig['filters'];
    // const { settings } = mergeSettings({ filters });
    // expect(settings.filters).toEqual(filters);
  });

  it('should import user params', () => {
    const params = ['search'] as TSMLReactConfig['params'];
    // const { settings } = mergeSettings({ params });
    // expect(settings.params).toEqual(params);
  });

  it('should import user times', () => {
    const times = ['morning'] as TSMLReactConfig['times'];
    // const { settings } = mergeSettings({ times });
    // expect(settings.times).toEqual(times);
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
    //   const { settings } = mergeSettings({ weekdays });
    //   expect(settings.weekdays).toEqual(weekdays);
  });

  it('should fall back to english', () => {
    languageGetter.mockReturnValue('de');
    // const { settings } = mergeSettings();
    // expect(settings.language).toEqual('en');
  });
});
