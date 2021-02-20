# TSML UI

TSML UI is a React JS module that makes TSML available for use on any web page, and you can use it with no coding experience. Just get your meeting information in the right format on a Google Sheet or JSON, copy-paste a few lines of code, and you're set.

TSML UI is the same meeting finder found in the [12 Step Meeting List](https://github.com/code4recovery/12-step-meeting-list) WordPress plugin, but made available as a React JS module for use on any web platform, even Wordpress.

[Here's a demo](https://react.meetingguide.org/) of what the meeting finder looks like with no styling.

Advantanges:

- better performance for users
- reduced strain on servers
- can be used on any web platform
- can be embedded in any layout
- wider pool of potential project contributors (not just WordPress developers)
- simplifies WordPress plugin (separation of concerns)

## Install on Your Website

You don't need to download anything. Let's get started by putting TSML_UI on your webpage. We'll use this [demo Google Sheet](https://docs.google.com/spreadsheets/d/1iEHbgXYMUdSjcrRRguBqa97yP61nm3fHg_tDrChFSLg/edit?usp=sharing) accessed by [its JSON feed](https://spreadsheets.google.com/feeds/list/1iEHbgXYMUdSjcrRRguBqa97yP61nm3fHg_tDrChFSLg/od6/public/values?alt=json).

Simply add the following code to your page:

1. In your `<head>` add:

        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
        <link rel="stylesheet" href="https://react.meetingguide.org/style.css">

2. In your `<body>` add:

        <script>
          var tsml_react_config = {
              timezone: 'America/New_York'
          };
        </script>
        <meetings src="https://spreadsheets.google.com/feeds/list/1iEHbgXYMUdSjcrRRguBqa97yP61nm3fHg_tDrChFSLg/od6/public/values?alt=json">
        <script src="https://react.meetingguide.org/app.js" async></script>

3. If you are already hosting a valid JSON file, then in <meetings src=" "> replace the demo with your `/path/to/meetings.json`.

## Populate Data

### 12 Step Meeting List

If you're using the 12 Step Meeting List plugin for WordPress, you may use the shortcode `[tsml_react]`. There is no need to follow the installation instructions above.

### Google Sheet Support

To use a Google Sheet as your backend:

1. Publish a Google Sheet that looks like [this example](https://docs.google.com/spreadsheets/d/e/2PACX-1vQJ5OsDCKSDEvWvqM_Z6tmXe4N-VYEnEAfvU5PX5QXZjHVbnrX-aeiyhWnZp0wpWtOmWjO4L5GJtfFu/pubhtml).
1. Use this [blog post](https://benborgers.com/posts/google-sheets-json) to determine what the JSON URL of your sheet is.
1. Use that JSON URL as the `src` for your `meetings` tag.

## Configure Maps

To add a free map to your site:

1.  Sign up for [Mapbox](https://mapbox.com) (very easy and doesn't require a credit card)
1.  Copy your Public Access Token
1.  Use it in a `mapbox` parameter on your `meetings` tag, eg

        <meetings src="/path/to/meetings.json" mapbox="pk.aaaaabbbbbcccccdddddeeeeefffffgggg"/>

If you're using a Google Sheet, you will have to add `Latitude` and `Longitude` columns for the map to appear. There are [some tools](https://www.google.com/search?q=google+sheet+geocode) that can help.

## Enable "Near Me" Mode

You don't need to do anything other than enable HTTPS on your website. To ensure all users see this functionality, make sure that anyone who enters a `http://` address for your site is redirected to the `https://` address.

## Advanced Customization

See [src/helpers/settings.js](settings.js) for options that can be set by defining a `tsml_react_config` object. You can customize many of the behaviors and any text string that the app uses. It's only necessary to specify those values you wish to override.

### Set your timezone

`America/New_York` is the default. To change it, add this code inside a `<script>` tag.

    var tsml_react_config = {
      timezone: 'America/Los_Angeles'
    };

### Change strings

Here is another example with two strings overridden.

    var tsml_react_config = {
      strings: {
        en: {
          region: 'City',
          types: {
            BE: 'Beginner',
          },
        },
      },
    };

A complete list of meeting types can be found in the [Meeting Guide format spec](https://github.com/code4recovery/spec).

### Changing the Search Function

The search function has three options:

- `default`: west chester|brooklyn|manhattan
- `or`: west chester OR brooklyn OR manhattan
- `quoted`: "west chester" brooklyn manhattan

The default requires the pipe character for search, but is also the most straight forward; most users will likely only be search for one town ("West Chester"), a ZIP code ("19147"), or a meeting name ("Happy Hour"). However, the two other search options allow for more precise searching; you can return multiple results for adjacent towns.

For more details, please see: [Search: How It Works](README-search.md).

## Next Steps

- [x] Hierarchical region dropdown
- [x] Alternate appearance of `TC` meetings (hide directions and cross out address)
- [x] Alternate appearance of approximate addresses (no location list group, zoom out map, no popup)
- [x] Display group info on inside page
- [x] Distance dropdown instead of regions when in near me or location mode
- [x] Spanish
- [x] French
- [x] Near location mode with geocoding
- [ ] Filter-clearing buttons when no results
- [ ] Accessibility improvements
- [ ] Select multiple dropdown items on mobile
- [ ] Proper `href` attributes (instead of `#`) in controls for SEO

## Contributing

Pull requests are welcome. To get started, clone this repository, run `yarn`, and point your web root at the `public` folder.

This project uses [React JS](https://reactjs.org/) and [Bootstrap CSS](http://getbootstrap.com/).

While developing, run `yarn watch` to compile assets as you edit them. When you're ready to commit, run `yarn prod` to prepare them for production.
