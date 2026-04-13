import { renderHook } from '@testing-library/react';
import { createElement } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SettingsProvider, useSettings } from '../../../src/hooks';

describe('settings', () => {
  let languageGetter: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    languageGetter = vi.spyOn(window.navigator, 'language', 'get');
  });

  const renderSettings = (userSettings?: Partial<TSMLReactConfig>) => {
    return renderHook(() => useSettings(), {
      wrapper: ({ children }) =>
        createElement(
          SettingsProvider,
          { userSettings: userSettings as TSMLReactConfig },
          children
        ),
    });
  };

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

  it('falls back to english when navigator.language is unsupported', () => {
    languageGetter.mockReturnValue('de');
    const { result } = renderSettings();
    expect(result.current.settings.language).toBe('en');
  });

  it('uses navigator.language when no language is configured', () => {
    languageGetter.mockReturnValue('es-MX');
    const { result } = renderSettings();
    expect(result.current.settings.language).toBe('es');
  });

  it('uses tsml_react_config language when set, ignoring navigator.language', () => {
    languageGetter.mockReturnValue('en-US');
    const { result } = renderSettings({ language: 'fr' });
    expect(result.current.settings.language).toBe('fr');
  });
});
