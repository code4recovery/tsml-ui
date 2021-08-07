//send analytics to google (other providers possible)
//category = 'search', action = 'search' or 'location', label = 'odaat'
export function analyticsEvent({ category, action, label, debug = false }) {
  if (typeof gtag === 'function') {
    //https://developers.google.com/analytics/devguides/collection/gtagjs/events
    gtag('event', action, {
      event_category: category,
      event_label: label,
    });
    if (debug) {
      console.log(`recorded gtag event for "${label}"`);
    }
  } else if (typeof ga === 'function') {
    //https://developers.google.com/analytics/devguides/collection/analyticsjs/events
    ga('send', {
      hitType: 'event',
      eventCategory: category,
      eventAction: action,
      eventLabel: label,
    });
    if (debug) {
      console.log(`recorded ga event for "${label}"`);
    }
  } else if (debug) {
    console.log('did not record analytics event');
  }
}
