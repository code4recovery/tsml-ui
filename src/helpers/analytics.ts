//send analytics to google (other providers possible)
//category = 'search', action = 'search' or 'location', label = 'odaat'
export function analyticsEvent({
  category,
  action,
  label,
}: {
  category: string;
  action: string;
  label: string;
}) {
  if (typeof gtag === 'function') {
    //https://developers.google.com/analytics/devguides/collection/gtagjs/events
    gtag('event', action, {
      event_category: category,
      event_label: label,
    });
    //console.log(`TSML UI recorded gtag event for "${label}"`);
  } else if (typeof ga === 'function') {
    //https://developers.google.com/analytics/devguides/collection/analyticsjs/events
    ga('send', {
      hitType: 'event',
      eventCategory: category,
      eventAction: action,
      eventLabel: label,
    });
    //console.log(`TSML UI recorded ga event for "${label}"`);
  } else {
    //console.log('TSML UI did not record analytics event');
  }
}
