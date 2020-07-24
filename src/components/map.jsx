import React, { useRef, useState, useLayoutEffect } from 'react';
import ReactMapGL, { Marker, NavigationControl, Popup } from 'react-map-gl';
import WebMercatorViewport from 'viewport-mercator-project';

import { settings, strings } from '../helpers/settings';
import Link from './link';
import Button from './button';

export default function Map({
  filteredSlugs,
  state,
  setAppState,
  setMapInitialized,
}) {
  const [popup, setPopup] = useState(null);
  const [viewport, setViewport] = useState(null);
  const mapFrame = useRef();

  const bounds = {};
  const locations = {};

  //first get map size
  useLayoutEffect(() => {
    setViewport({
      width: mapFrame.current.offsetWidth,
      height: mapFrame.current.offsetHeight,
    });
  }, []);

  filteredSlugs.forEach(slug => {
    const meeting = state.meetings[slug];

    if (meeting.latitude && meeting.latitude) {
      const coords = meeting.longitude + ',' + meeting.latitude;

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

  //sort so southern pins appear in front
  const locationKeys = Object.keys(locations).sort((a, b) => {
    return locations[b].latitude - locations[a].latitude;
  });

  //make the viewport
  if (viewport && !state.map_initialized) {
    setMapInitialized();
    setViewport(
      bounds.west === bounds.east
        ? {
            latitude: bounds.north,
            longitude: bounds.west,
            zoom: 14,
          }
        : new WebMercatorViewport(viewport).fitBounds(
            [
              [bounds.west, bounds.south],
              [bounds.east, bounds.north],
            ],
            {
              padding: Math.min(viewport.width, viewport.height) / 10,
            }
          )
    );
  }

  return (
    <div className="border rounded bg-light flex-grow-1 map" ref={mapFrame}>
      {viewport && (
        <ReactMapGL
          {...viewport}
          mapboxApiAccessToken={settings.keys.mapbox}
          mapStyle={settings.mapbox_style}
          onViewportChange={setViewport}
          style={{ position: 'absolute' }}
          width="100%"
          height="100%"
        >
          {locationKeys.map(key => {
            const location = locations[key];

            //create a link for directions
            const iOS =
              !!navigator.platform &&
              /iPad|iPhone|iPod/.test(navigator.platform);

            location.directions_url = `${
              iOS ? 'maps://' : 'https://www.google.com/maps'
            }?daddr=${location.latitude},${
              location.longitude
            }&saddr=Current+Location&q=${encodeURIComponent(
              location.formatted_address
            )}`;

            return (
              <div key={key}>
                <Marker
                  latitude={location.latitude}
                  longitude={location.longitude}
                  offsetLeft={-settings.marker_style.width / 2}
                  offsetTop={-settings.marker_style.height}
                >
                  <div
                    title={location.name}
                    style={settings.marker_style}
                    onClick={() => setPopup(key)}
                  />
                </Marker>
                {popup == key && (
                  <Popup
                    latitude={location.latitude}
                    longitude={location.longitude}
                    className="popup"
                    closeOnClick={false}
                    onClose={() => setPopup(null)}
                    offsetTop={-settings.marker_style.height}
                  >
                    <h4 className="font-weight-light">{location.name}</h4>
                    <p>{location.formatted_address}</p>
                    <ul className="list-group mb-3">
                      {location.meetings.map(meeting => (
                        <li key={meeting.slug} className="list-group-item">
                          <time>{meeting.formatted_time}</time>
                          <Link
                            meeting={meeting}
                            state={state}
                            setAppState={setAppState}
                          />
                        </li>
                      ))}
                    </ul>
                    {location.directions_url && (
                      <Button
                        href={location.directions_url}
                        text={strings.get_directions}
                        icon={'directions'}
                      />
                    )}
                  </Popup>
                )}
              </div>
            );
          })}
          <div className="control">
            <NavigationControl
              showCompass={false}
              onViewportChange={setViewport}
            />
          </div>
        </ReactMapGL>
      )}
    </div>
  );
}
