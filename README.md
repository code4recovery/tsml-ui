# Website Meeting Finder 2.0

With only a [Meeting Guide format JSON file](https://github.com/meeting-guide/spec), developers can soon have the same meeting finder found in the [12 Step Meeting List](https://github.com/meeting-guide/12-step-meeting-list) WordPress plugin on any website platform. 

Advantanges:

* faster performance for users
* less strain on servers
* supports any web platform
* easily embedded into any layout
* wider pool of potential project contributors (not just WordPress webmasters)
* simplifies WordPress plugin (separation of concerns)
* enables the much-requested meetings shortcode

## Installation

You don't need to download anything. Simply add the following code to your page:

1. In your `<head>` add:

		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
		<link rel="stylesheet" href="https://react.meetingguide.org/style.css">


1. In your `<body>` add:
			
		<meetings src="/path/to/meetings.json"></meetings>
		<script src="https://react.meetingguide.org/react.js" async></script>

1. Edit `/path/to/meetings.json` in the code above to point to your JSON file.

## Configuration

See [src/settings.jsx](settings.jsx) for options that can be set by defining a `window.config` object. You can customize many of the behaviors and all of the text strings that the app uses. Only include the values you wish to override.

### Change the column heading “Region” to “City”

	window.config = {
		strings: {
			en: {
				region: 'City',
			},
		},
	};

### Change “Newcomer” meeting type to “Beginner”

	window.config = {
		strings: {
			en: {
				types: {
					BE: 'Beginner',
				},				
			},
		},
	};
	
A full list of meeting types can be found on the [Meeting Guide format spec page](https://github.com/meeting-guide/spec). These can be overridden by specifying the code and preferred nomenclature as demonstrated above.

## To Do

- [x] Error message when no data specified, or error loading data
- [x] Display day in list when multiple
- [x] Hide map and proximity features if no coordinates in data
- [x] Hide filters if not present in data
- [x] Inside page
- [x] Isolate CSS so it doesn't interfere with overall site layout
- [x] Mobile list view
- [x] Multilingual support
- [x] Day query string: don't automatically specify day, support for `any` value
- [ ] Mapbox support
- [ ] Near location mode with geocoding
- [ ] Near me mode
- [ ] Google Docs support

### Nice to have

- [ ] Better internationalization for title
- [ ] Sortable columns
- [ ] Hierarchical regions support
- [ ] Google Maps support
- [ ] Slugs (eg `sun`) in query string instead of day IDs
- [ ] Slugs (eg `mountain-view`) in query string instead of region IDs
- [ ] Select multiple dropdown items on mobile
- [ ] Query string key prefix setting
- [ ] Condition clearing in no results alert
- [ ] Reduce memory by forgetting unneeded meeting data, eg URLs
- [ ] Display group names and Venmo links on inside page
- [ ] Feedback form on inside page
- [ ] Remove any settings from settings.jsx that should not be overridden

### Questions

- [x] Possible to do a custom tag? eg `<meetings src="/path/to/meetings"></meetings>`
- [x] How to handle email transport?
- [ ] What will the impact be on SEO?

## Contributing

Pull requests are welcome. To get started, clone this repository, do an `npm install`, and point your web root at the `public` folder.

This project uses [React JS](https://reactjs.org/) and [Bootstrap CSS](http://getbootstrap.com/).

While developing, run the `npm run watch` terminal command to compile assets as you edit them. When you're ready to commit, run `npm run prod` to prepare them for production.