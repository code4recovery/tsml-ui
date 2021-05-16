import React, { useEffect, useRef, useState } from 'react';
import ReactMapGL, { Marker, NavigationControl, Popup } from 'react-map-gl';
import WebMercatorViewport from 'viewport-mercator-project';

import { formatAddress, settings, strings } from '../helpers';
import Button from './Button';
import Link from './Link';
import Stack from './Stack';

export default function Map({ filteredSlugs, state, setState }) {
  const [popup, setPopup] = useState(null);
  const [viewport, setViewport] = useState(null);
  const [data, setData] = useState({
    locations: {},
    bounds: {},
    locationKeys: [],
  });
  const [dimensions, setDimensions] = useState(null);
  const mapFrame = useRef();

  //window size listener (todo figure out why height can go up but not down)
  useEffect(() => {
    const resizeListener = () => {
      setDimensions({
        width: mapFrame.current.offsetWidth - 2,
        height: mapFrame.current.offsetHeight - 2,
      });
    };
    resizeListener();
    window.addEventListener('resize', resizeListener);
    return () => {
      window.removeEventListener('resize', resizeListener);
    };
  }, []);

  //reset bounds and locations when filteredSlugs changes
  useEffect(() => {
    const locations = {};
    const bounds = {};

    filteredSlugs.forEach(slug => {
      const meeting = state.meetings[slug];

      const address = formatAddress(meeting.formatted_address);

      if (
        !!meeting.latitude &&
        !!meeting.latitude &&
        !!address &&
        !meeting.types.includes(strings.types.TC)
      ) {
        const coords = meeting.latitude + ',' + meeting.longitude;

        //create a new pin
        if (!locations.hasOwnProperty(coords)) {
          locations[coords] = {
            name: meeting.location,
            formatted_address: meeting.formatted_address,
            latitude: meeting.latitude,
            longitude: meeting.longitude,
            //probably a directions link here
            meetings: [],
          };
        }

        //expand bounds
        if (!bounds.north || meeting.latitude > bounds.north)
          bounds.north = meeting.latitude;
        if (!bounds.south || meeting.latitude < bounds.south)
          bounds.south = meeting.latitude;
        if (!bounds.east || meeting.longitude > bounds.east)
          bounds.east = meeting.longitude;
        if (!bounds.west || meeting.longitude < bounds.west)
          bounds.west = meeting.longitude;

        //add meeting to pin
        locations[coords].meetings.push(meeting);
      }
    });

    //quick reference array
    const locationKeys = Object.keys(locations).sort(
      (a, b) => locations[b].latitude - locations[a].latitude
    );

    //set state (sort so southern pins appear in front)
    setData({
      bounds: bounds,
      locations: locations,
      locationKeys: locationKeys,
    });
  }, [filteredSlugs]);

  //reset viewport when data or dimensions change
  useEffect(() => {
    if (!dimensions || !data.bounds) return;
    setViewport(
      data.bounds.west === data.bounds.east
        ? {
            ...dimensions,
            latitude: data.bounds.north,
            longitude: data.bounds.west,
            zoom: 14,
          }
        : new WebMercatorViewport(dimensions).fitBounds(
            [
              [data.bounds.west, data.bounds.south],
              [data.bounds.east, data.bounds.north],
            ],
            {
              padding: Math.min(dimensions.width, dimensions.height) / 10,
            }
          )
    );
  }, [data, dimensions]);

  return (
    <div className="border rounded bg-light flex-grow-1 map" ref={mapFrame}>
      {!!viewport && !!data.locationKeys.length && (
        <ReactMapGL
          {...viewport}
          mapboxApiAccessToken={settings.map.key}
          mapStyle={settings.map.style}
          onViewportChange={setViewport}
        >
          {data.locationKeys.map(key => {
            const location = data.locations[key];

            //create a link for directions
            const iOS =
              !!navigator.platform &&
              /iPad|iPhone|iPod/.test(navigator.platform);

            location.directions_url = `${
              iOS ? 'maps://' : 'https://www.google.com/maps'
            }?daddr=${location.latitude},${
              location.longitude
            }&saddr=Current+Location&q=${encodeURI(
              location.formatted_address
            )}`;

            return (
              <div key={key}>
                <Marker
                  latitude={location.latitude}
                  longitude={location.longitude}
                  offsetLeft={-settings.map.markers.location.width / 2}
                  offsetTop={-settings.map.markers.location.height}
                >
                  <div
                    title={location.name}
                    style={settings.map.markers.location}
                    onClick={() => setPopup(key)}
                  />
                </Marker>
                {popup == key && (
                  <Popup
                    latitude={location.latitude}
                    longitude={location.longitude}
                    closeOnClick={false}
                    onClose={() => setPopup(null)}
                    offsetTop={-settings.map.markers.location.height}
                  >
                    <Stack>
                      <h4 className="font-weight-light">{location.name}</h4>
                      <p>{location.formatted_address}</p>
                      <div className="list-group mb-1">
                        {location.meetings
                          .sort((a, b) => a.start.isAfter(b.start))
                          .map(meeting => (
                            <div key={meeting.slug} className="list-group-item">
                              <time className="d-block">
                                {meeting.start.format('h:mm a')}
                                <span className="ms-1">
                                  {
                                    strings[
                                      settings.weekdays[
                                        meeting.start.format('d')
                                      ]
                                    ]
                                  }
                                </span>
                              </time>
                              <Link
                                meeting={meeting}
                                state={state}
                                setState={setState}
                              />
                            </div>
                          ))}
                      </div>
                      {!!location.directions_url && (
                        <Button
                          href={location.directions_url}
                          text={strings.get_directions}
                          icon={'directions'}
                        />
                      )}
                    </Stack>
                  </Popup>
                )}
              </div>
            );
          })}
          <NavigationControl
            className="d-none d-md-block"
            onViewportChange={setViewport}
            showCompass={false}
            style={{ top: 10, right: 10 }}
          />
        </ReactMapGL>
      )}
    </div>
  );
}
