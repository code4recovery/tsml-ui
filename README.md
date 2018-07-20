# Website Meeting Finder 2.0

With only a [Meeting Guide format JSON file](https://github.com/meeting-guide/spec), developers will soon be able to 
have the same meeting finder found in the [12 Step Meeting List](https://github.com/meeting-guide/12-step-meeting-list)
WordPress plugin on any website platform.

## Technology

This project makes use of the [React JavaScript library](https://reactjs.org/) and the [Bootstrap component library](http://getbootstrap.com/).

## Installation

You don't need to download anything. Simply add the following code to your web page:

1. In your `<head>` add:

		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
		<link rel="stylesheet" href="https://react.meetingguide.org/compiled/style.css">


1. In your `<body>` add:
			
		<div class="app"></div>
		<script>
			window.config = {
				json: '/path/to/meetings.json',
			}
		</script>
		<script src="https://react.meetingguide.org/compiled/react.js"></script>

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