# Website Meeting Finder 2.0

With only a [Meeting Guide format JSON file](https://github.com/meeting-guide/spec), developers will soon be able to have the same meeting finder found in the [12 Step Meeting List](https://github.com/meeting-guide/12-step-meeting-list) WordPress plugin on any website platform. 

Advantanges:

* better performance for end users
* less strain on server (client-side processing)
* supports any web platform
* wider pool of possible contributors (not just WordPress webmasters)
* simplifies WordPress plugin (separation of concerns)

## Installation

You don't need to download anything. Simply add the following code to your page:

1. In your `<head>` add:

		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
		<link rel="stylesheet" href="https://react.meetingguide.org/style.css">


1. In your `<body>` add:
			
		<div id="app"></div>
		<script>
			window.config = {
				json: '/path/to/meetings.json',
			}
		</script>
		<script src="https://react.meetingguide.org/react.js"></script>

1. Customize `path/to/meetings.json` in the code above to point to your local JSON file.

## Configuration

See [settings.jsx](settings.jsx) for other options that can be included in your `window.config` object. You can customize many of the behaviors and all of the text strings that the app uses.

## FAQ

### Change the column heading "Region" to "City"

	window.config = {
		...
		strings: {
			region: 'City',
		}
	}

### Change "Newcomer" meeting type to "Beginner"

	window.config = {
		...
		strings: {
			types: {
				BE: 'Beginner',
			},
		}
	}

## Contributing

Pull requests are welcome. To get started, download this repository, do an `npm install`, and point your web root at the `public` folder.

This project uses the [React JavaScript library](https://reactjs.org/) and the [Bootstrap component library](http://getbootstrap.com/).

While developing, run the `npm run watch` terminal command to compile assets as you edit them. When you're ready to commit, run `npm run prod` to minify them.