import { analyticsEvent } from '../analytics';

window.gtag = jest.fn();
window.ga = jest.fn();

describe('analytics', () => {
  it('calls gtag if defined', () => {
    analyticsEvent({ action: 'foo', category: 'bar', label: 'baz' });

    expect(gtag).toHaveBeenCalledWith('event', 'foo', {
      event_category: 'bar',
      event_label: 'baz',
    });
  });

  it('calls ga if defined when gtag is undefined', () => {
    window.gtag = undefined;

    analyticsEvent({ action: 'foo', category: 'bar', label: 'baz' });

    expect(ga).toHaveBeenCalledWith('send', {
      eventAction: 'foo',
      eventCategory: 'bar',
      eventLabel: 'baz',
      hitType: 'event',
    });
  });
});
