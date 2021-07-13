//send analytics to google (other providers possible)
//category = 'search', action = 'search' or 'location', label = 'search_term', value = 'odaat'
export function analyticsEvent({ category, action, label, value }) {
  if (typeof ga === 'function') {
    //https://developers.google.com/analytics/devguides/collection/analyticsjs/events
    ga('send', {
      hitType: 'event',
      eventCategory: category,
      eventAction: action,
      eventLabel: label,
      eventValue: value,
    });
  } else if (typeof gtag === 'function') {
    //https://developers.google.com/analytics/devguides/collection/gtagjs/events
    gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
}
