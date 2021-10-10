# TSML UI

TSML UI is a React web app that makes the [12 Step Meeting List](https://github.com/code4recovery/12-step-meeting-list) interface available for use on any web page, regardless of platform.

[Here's a demo](https://react.meetingguide.org/) of what the meeting finder looks like with no styling. [Here's another demo](https://react.meetingguide.org/demo.html) embedded into a different design, with a Google Sheet as a data source.

To use TSML UI on your website you only need to add some HTML to your web page. To get started, use our [TSML UI configuration helper](https://tsml-ui-config.netlify.app).

## Configure

### Enable "Near Me" mode

You don't need to do anything other than enable HTTPS on your website. To ensure all users see this functionality, make sure that anyone who enters a `http://` address for your site is redirected to the `https://` address.

### Caching

TSML UI can cache data in session storage, which can speed up performance, but it is turned off by default. To enable it, add 

    var tsml_react_config = {
      cache: true,
    };

Your mileage may vary. It has been known to encounter a `QuotaExceededError` with large datasets. Also when editing meetings, changes will not appear until you restart your browser or run `window.sessionStorage.clear()` in the console.

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

## Frequently asked questions

### How are metatypes like "Active" and "Online" calculated?

Metatypes are types that are not specified explicitly in the data, they are inferred from the data based on this logic:

- A meeting is considered `In-Person` if it doesn't have a type of `Location Temporarily Closed` and it has a specific street address.

- A meeting is considered `Online` if it has a `conference_url` that matches our recognized formats and/or it has a `conference_phone`

- A meeting is considered `Active` if it's `In-Person` or `Online`, otherwise it's `Inactive`.

### Why no "Hybrid" type?

This app exists to help people find AA meetings, and after much discussion we decided that Hybrid was not a useful filter type for that purpose. We believe that people on the whole do not set out looking for a hybrid meeting, they simply want to know whether their online or in-person meeting happens to be hybrid. They will know this by its appearance in the list.

Second, while we can infer that a meeting is "online" if there is a Zoom URL (for example) in the listing, the app should not assume that, when there are online and in-person options, that means it is an actual "hybrid" meeting with a video screen and speakers in the room.

Web servants may [add their own meetimg types](#add-custom-types) of course.

## Next steps

- [x] Hierarchical region dropdown
- [x] Alternate appearance of `TC` meetings (hide directions and cross out address)
- [x] Alternate appearance of approximate addresses (no location list group, zoom out map, no popup)
- [x] Display group info on inside page
- [x] Distance dropdown instead of regions when in near me or location mode
- [x] Spanish
- [x] French
- [x] Near location mode with geocoding
- [x] Accessibility improvements
- [x] Proper `href` attributes (instead of `#`) in controls for SEO
- [ ] Filter-clearing buttons when no results
- [ ] Select multiple dropdown items on mobile

## Contributing

Pull requests are welcome. To get started, clone this repository, run `yarn`, and point your web root at the `public` folder.

While developing, run `yarn watch` to compile assets as you edit them. When you're ready to commit, run `yarn prod` to minify them for production.

## Credits

This project uses [React JS](https://reactjs.org/) and [Bootstrap CSS](https://getbootstrap.com/).
