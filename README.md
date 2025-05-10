# TSML UI &nbsp; [![Coverage Status](https://coveralls.io/repos/github/code4recovery/tsml-ui/badge.svg?branch=main)](https://coveralls.io/github/code4recovery/tsml-ui?branch=main)

TSML UI (12 Step Meeting List User Interface) is an interactive meeting finder makes the [12 Step Meeting List](https://github.com/code4recovery/12-step-meeting-list) interface available for use on any web page, regardless of platform.

Here are two demos:

- [San Francisco / Marin](https://aasfmarin.org/meetings) (uses a custom database as a data source)

- [Santa Cruz](https://aasantacruz.org/meeting-guide/) (WordPress / 12 Step Meeting List data source)

To use TSML UI on your website you only need to add some HTML to your web page. To get started, use our [configuration instructions](https://tsml-ui.code4recovery.org).

## Configure

### Enable "Near Me" mode

You don't need to do anything other than enable HTTPS on your website. To ensure all users see this functionality, make sure that anyone who enters a `http://` address for your site is redirected to the `https://` address.

### Add custom types

Here is an example of extending the `tsml_react_config` object to include a definition for an additional meeting type.

```js
var tsml_react_config = {
  strings: {
    en: {
      types: {
        BEACH: 'Beach Meeting',
      },
    },
  },
};
```

A.A. groups that wish to participate in the Meeting Guide app should be careful not to repurpose types already in use. A full list of A.A. meeting types can be found in the [Meeting Guide format spec](https://github.com/code4recovery/spec).

### Override type descriptions

A.A. meeting type descriptions are automatically applied to Open and Closed types. These can be unset or overwritten as needed.

```js
var tsml_react_config = {
  strings: {
    en: {
      type_descriptions: {
        O: 'This is a custom Open description',
        C: undefined, //this type description has been unset
      },
    },
  },
};
```

### Override type defaults

If you wanted to add a list that is pre-filtered to a single type, "Women" in this example, you can add this code:

```js
var tsml_react_config = {
  defaults: { type: ['women'] },
  show: {
    controls: false,
    title: false,
  },
};
```

### Use kilometers

Distances can be calculated in miles (`mi`) or kilometers (`km`).

```js
var tsml_react_config = {
  distance_unit: 'km',
};
```

### Disable Add to Calendar button

You can disable the add to calendar button if needed.

```js
var tsml_react_config = {
  calendar_enabled: false,
};
```

### Customize theme colors

You can use CSS variables to customize TSML UI’s appearance. Here are the defaults:

```css
#tsml-ui {
  --alert-background: #faf4e0;
  --alert-text: #998a5e;
  --background: #fff;
  --border-radius: 4px;
  --focus: #0d6efd40;
  --font-family: system-ui, -apple-system, sans-serif;
  --font-size: 16px;
  --in-person: #146c43;
  --inactive: #b02a37;
  --link: #0d6efd;
  --online: #0a58ca;
  --online-background-image: url(https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=1440&ixid=MnwxfDB8MXxhbGx8fHx8fHx8fHwxNjIyMTIzODkw&ixlib=rb-1.2.1&q=80&utm_campaign=api-credit&utm_medium=referral&utm_source=unsplash_source&w=1920);
  --text: #212529;
}
```

Only specify the variables you wish to override in your code. Hex values (`#123456`) must be used when specifiying colors.

### Dark mode

If your website theme supports responsive dark mode, TSML UI can match it with a media query: In [this demo](https://tsml-ui.code4recovery.org/tests/aasanjose.html) the background will be white if the user prefers a light appearance, and black if they prefer dark.

```css
@media (prefers-color-scheme: dark) {
  #tsml-ui {
    --background: #000;
    --color: #fff;
    --link: #7bc8ff;
  }
}
```

### Change the online background image

This image will be shown instead of a map for online meetings. Should be roughly 2000px wide and tall.

```css
#tsml-ui {
  --online-background-image: url(/path/to/image.jpg);
}
```

To remove:

```css
#tsml-ui {
  --online-background-image: none;
}
```

## Frequently asked questions

### How do timezones work?

If you are only listing meetings in a single timezone, e.g. Philadelphia, PA, then you should specify a `data-timezone` attribute in your embed code. This must be in the proper [IANA timezone format](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones) e.g. `America/New_York`. TSML UI will assume that any meetings without a specified timezone are in that zone.

However if your site lists meetings in a variety of timezones, and you have a timezone key/column in your meeting data, then you may omit the `data-timezone` attribute and times will be translated into the user's timezone.

Note: The WordPress plugin 12 Step Meeting List does not yet support timezone keys in meeting data.

### How are metatypes like "Active" and "Online" calculated?

Metatypes are types that are not specified explicitly in the data, they are inferred from the data based on this logic:

- A meeting is considered `In-Person` if it doesn't have a type of `Location Temporarily Closed` and it has a specific street address.

- A meeting is considered `Online` if it has a `conference_url` that matches our recognized formats and/or it has a `conference_phone`

- A meeting is considered `Active` if it's `In-Person` or `Online`, otherwise it's `Inactive`.

### Why no "Hybrid" type?

This app exists to help people find A.A. meetings, and after much discussion we decided that Hybrid was not a useful filter type for that purpose. We believe that people on the whole do not set out looking for a hybrid meeting, they simply want to know whether their online or in-person meeting happens to be hybrid. They will know this by its appearance in the list.

Second, while we can infer that a meeting is "online" if there is a Zoom URL (for example) in the listing, the app should not assume that, when there are online and in-person options, that means it is an actual "hybrid" meeting with a video screen and speakers in the room.

Web servants may [add their own meeting types](#add-custom-types) of course.

### What is Speaker/Discussion?

When meetings are tagged both Speaker (`SP`) and Discussion (`D`), TSML UI merges them into a combined Speaker/Discussion type. This enables users to use existing filters to locate Speaker-only and Discussion-only meetings.

### Can I import TSML UI from NPM for use in a NextJS or Gatsby project?

Not yet! Please open a pull request and walk us through the process of adding it to NPM and we'll give it a shot.

## Contributing

Contributions are welcome. Ideally, please join [Code for Recovery](https://code4recovery.org/) (we have no dues or fees) beforehand to discuss your proposed changes, or at a minimum file an issue. (The one exception: language translations do not need an issue beforehand.)

Here are the steps to follow when developing:

1. clone (or, if you are not a member, fork and clone) this repository
1. create a branch for your changes
1. run `npm i` in the project folder (install NPM if it is not installed)
1. run `npm run serve` in one terminal window (or use another solution to serve files locally)
1. run `npx mix watch` in another terminal window (this updates files in development as you change them)
1. confirm your changes at, for example, `http://localhost:3000/tests/aasanjose` (there are a number of examples in that folder)

When you are ready to make a PR:

1. clean up your diff, try to change as few lines as possible
1. run prettier locally to autoformat your files
1. alphabetize things like component props and CSS rules (if applicable)
1. run `npx mix --production` to minify files
