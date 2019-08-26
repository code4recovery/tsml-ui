# Website Meeting Finder 2.0

With only a [Meeting Guide format JSON file](https://github.com/meeting-guide/spec) or a Google Sheet, web servants can have the same meeting finder found in the [12 Step Meeting List](https://github.com/meeting-guide/12-step-meeting-list) WordPress plugin on any website platform. 

[Here's a demo](https://react.meetingguide.org/demo/) of what the meeting finder can look like embedded in a random website design.

Advantanges:

* faster performance for users
* reduced strain on servers
* can be used on any web platform
* can be embedded in any layout
* wider pool of potential project contributors (not just WordPress webmasters)
* simplifies WordPress plugin (separation of concerns)

## Installation

You don't need to download anything. Simply add the following code to your page:

1. In your `<head>` add:

		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
		<link rel="stylesheet" href="https://react.meetingguide.org/style.css">


1. In your `<body>` add:
			
		<meetings src="/path/to/meetings.json"/>
		<script src="https://react.meetingguide.org/app.js" async></script>

1. Edit `/path/to/meetings.json` in the code above to point to your JSON file.

## Google Sheet Support

To use a Google Sheet as your backend:

1. Publish a Google Sheet that looks like [this example](https://docs.google.com/spreadsheets/d/e/2PACX-1vQJ5OsDCKSDEvWvqM_Z6tmXe4N-VYEnEAfvU5PX5QXZjHVbnrX-aeiyhWnZp0wpWtOmWjO4L5GJtfFu/pubhtml).
1. Use this [blog post](https://coderwall.com/p/duapqq/use-a-google-spreadsheet-as-your-json-backend) to determine what the JSON URL of your sheet is.
2. Use that JSON URL as the `src` for your `meetings` tag.

## Maps

To add a free map to your site:

1. Sign up for [Mapbox](https://mapbox.com) (takes one minute and doesn't require a credit card)
1. Copy your Public Access Token
1. Use it in a `mapbox` parameter on your `meetings` tag, eg

		<meetings src="/path/to/meetings.json" mapbox="pk.aaaaabbbbbcccccdddddeeeeefffffgggg"/>

If you're using a Google Sheet, you will have to add `Latitude` and `Longitude` columns for your meetings to show up. There are [some tools](https://www.google.com/search?q=google+sheet+geocode) that can help.

## Advanced Customization

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
- [x] Scroll issue on inside page
- [x] Mapbox
- [x] Google Sheet support
- [ ] Near me mode
- [ ] Near location mode with geocoding
- [ ] Upcoming time filter
- [ ] Sortable columns
- [ ] Hierarchical regions support

### Nice to have

- [x] Better internationalization for title
- [ ] Slugs (eg `sun`) in query string instead of day IDs
- [x] Slugs (eg `mountain-view`) in query string instead of region IDs
- [ ] Select multiple dropdown items on mobile
- [ ] Condition-clearing buttons when no results
- [x] Reduce memory by forgetting unneeded meeting data, eg URLs
- [ ] Display group names and Venmo links on inside page
- [ ] Feedback form on inside page
- [ ] Auto-suggest locations as you type a location search

### Questions

- [x] Possible to do a custom tag? eg `<meetings src="/path/to/meetings"/>`
- [ ] How to handle email transport?
- [ ] What will the impact be on SEO?

## Contributing

Pull requests are welcome. To get started, clone this repository, do an `npm install`, and point your web root at the `public` folder.

This project uses [React JS](https://reactjs.org/) and [Bootstrap CSS](http://getbootstrap.com/).

While developing, run the `npm run watch` terminal command to compile assets as you edit them. When you're ready to commit, run `npm run prod` to prepare them for production.
