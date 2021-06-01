# TSML UI

TSML UI is a React web app that makes the [12 Step Meeting List](https://github.com/code4recovery/12-step-meeting-list) interface available for use on any web page, regardless of platform.

[Here's a demo](https://react.meetingguide.org/) of what the meeting finder looks like with no styling, [here's another demo](https://react.meetingguide.org/demo.html) embedded into a different design.

To use TSML UI on your website you only need to add some HTML to your web page. To get started, use our [TSML UI configuration helper](https://tsml-ui-config.netlify.app).

## Customize

See [src/helpers/settings.js](settings.js) for options that can be set by extending your `tsml_react_config` object. You can customize many of the behaviors and any text string that the app uses. It's only necessary to specify those values you wish to override.

### Enable "Near Me" mode

You don't need to do anything other than enable HTTPS on your website. To ensure all users see this functionality, make sure that anyone who enters a `http://` address for your site is redirected to the `https://` address.

### Add custom types

Here is an example of extending the `tsml_react_config` object to include a definition for an additional meeting type.

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

A list of AA meeting types can be found in the [Meeting Guide format spec](https://github.com/code4recovery/spec).

### Custom image instead of map on online meetings

Maps are not shown on meetings that are not meeting in person, which results in a lot of empty space on large screens. If you'd like to display a custom graphic here specifically for online meetings, try adapting this CSS to your needs.

    #tsml-ui .meeting.online .map::after {
      background-image: url(https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=1440&ixid=MnwxfDB8MXxhbGx8fHx8fHx8fHwxNjIyMTIzODkw&ixlib=rb-1.2.1&q=80&utm_campaign=api-credit&utm_medium=referral&utm_source=unsplash_source&w=1920);
      background-position: center center;
      background-repeat: no-repeat;
      background-size: cover;
      bottom: 0;
      content: '';
      left: 0;
      opacity: 0.25;
      position: absolute;
      right: 0;
      top: 0;
    }

### Changing the search

The search function has three options:

- `default`: west chester|brooklyn|manhattan
- `or`: west chester OR brooklyn OR manhattan
- `quoted`: "west chester" brooklyn manhattan

The default requires the pipe character for search, but is also the most straight forward; most users will likely only be search for one town ("West Chester"), a ZIP code ("19147"), or a meeting name ("Happy Hour"). However, the two other search options allow for more precise searching; you can return multiple results for adjacent towns.

For more details, please see: [Search: How It Works](README-search.md).

## Frequently asked questions

### How are metatypes like "Active" and "Online" calculated?

Metatypes are types that are not specified explicitly in the data, they are inferred from the data based on this logic:

- A meeting is considered `In-Person` if it doesn't have a type of `Location Temporarily Closed` and it has a specific street address.

- A meeting is considered `Online` if it has a `conference_url` that matches our recognized formats and/or it has a `conference_phone`

- A meeting is considered `Active` if it's `In-Person` or `Online`, otherwise it's `Inactive`.

### Why not a "hybrid" filter and meeting type?

This app exists to help people find AA meetings, and after much discussion we decided that Hybrid was not a useful filter type for that purpose. We believe that people on the whole do not set out looking for a hybrid meeting, they simply want to know whether their online or in-person meeting happens to be hybrid. They will know this by its appearance in the list.

Second, the app should not assume that if a meeting listing has both online and in-person options that it is an actual "hybrid" meeting with a video screen and speakers in the room.

Web servants may [add their own meetimg types](#add-custom-types) of course.

### Hide all "inactive" meetings?

If you have inactive meetings in your data that you can't remove but you'd prefer not be shown at all, then you can extend your config object like so:

    var tsml_react_config = {
      show: {
        inactive: false,
      },
    };

This will also hide the "Active" and "Inactive" filtering options.

## Next steps

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

While developing, run `yarn watch` to compile assets as you edit them. When you're ready to commit, run `yarn prod` to prepare them for production.

## Credits

This project uses [React JS](https://reactjs.org/) and [Bootstrap CSS](https://getbootstrap.com/).
