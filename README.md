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
  timezone: 'Pacific/Honolulu',
  strings: {
    en: {
      types: {
        BEACH: 'Beach Meeting',
      },
    },
  },
};
```

AA groups that wish to participate in the Meeting Guide app should be careful not to repurpose types already in use. A full list of AA meeting types can be found in the [Meeting Guide format spec](https://github.com/code4recovery/spec).

### Override type descriptions

AA meeting type descriptions are automatically applied to Open and Closed types. These can be unset or overwritten as needed.

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

## Frequently asked questions

### How are metatypes like "Active" and "Online" calculated?

Metatypes are types that are not specified explicitly in the data, they are inferred from the data based on this logic:

- A meeting is considered `In-Person` if it doesn't have a type of `Location Temporarily Closed` and it has a specific street address.

- A meeting is considered `Online` if it has a `conference_url` that matches our recognized formats and/or it has a `conference_phone`

- A meeting is considered `Active` if it's `In-Person` or `Online`, otherwise it's `Inactive`.

### Why no "Hybrid" type?

This app exists to help people find AA meetings, and after much discussion we decided that Hybrid was not a useful filter type for that purpose. We believe that people on the whole do not set out looking for a hybrid meeting, they simply want to know whether their online or in-person meeting happens to be hybrid. They will know this by its appearance in the list.

Second, while we can infer that a meeting is "online" if there is a Zoom URL (for example) in the listing, the app should not assume that, when there are online and in-person options, that means it is an actual "hybrid" meeting with a video screen and speakers in the room.

Web servants may [add their own meeting types](#add-custom-types) of course.

### Can I import TSML UI from NPM for use in a NextJS or Gatsby project?

Not yet! Please open a pull request and walk us through the process of adding it to NPM and we'll give it a shot.

## Contributing

Pull requests are welcome. To get started, clone this repository, run `npm i`, and point your web root at the `public` folder.

While developing, run `npx mix watch` to compile assets as you edit them. When you're ready to commit, run `npx mix --production` to minify them for production.

## Changelog

| Version | Date        | Changes                                                                   |
| ------- | ----------- | ------------------------------------------------------------------------- |
| 1.4.1   | Sep 6, 2022 | Google Sheet support<br/>Better error handling<br/>Mobile layout tweaks   |
| 1.4     | Sep 4, 2022 | Replaced `moment-timezone` with `luxon`<br/>Restyled in-progress meetings |
