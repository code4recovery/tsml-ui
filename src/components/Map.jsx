import React, { useEffect, useRef, useState } from 'react';
import ReactMapGL, { Marker, NavigationControl, Popup } from 'react-map-gl';
import WebMercatorViewport from 'viewport-mercator-project';

import { formatDirectionsUrl, settings, strings } from '../helpers';
import Button from './Button';
import Link from './Link';

export default function Map({
  filteredSlugs,
  listMeetingsInPopup = true,
  state,
  setState,
  mapbox,
}) {
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
      const { width, height } = mapFrame.current.getBoundingClientRect();
      if (width && height) {
        setDimensions({
          width: width - 2,
          height: height - 2,
        });
      }
    };
    resizeListener();
    window.addEventListener('resize', resizeListener);
    return () => {
      window.removeEventListener('resize', resizeListener);
    };
  }, []);

  //manage classes
  useEffect(() => {
    if (!state.input?.meeting) {
      document.body.classList.add('tsml-ui-map');
    }
    return () => {
      document.body.classList.remove('tsml-ui-map');
    };
  }, [state.input?.meeting]);

  //reset bounds and locations when filteredSlugs changes
  useEffect(() => {
    const locations = {};
    const bounds = {};

    filteredSlugs.forEach(slug => {
      const meeting = state.meetings[slug];

      if (meeting?.latitude && meeting?.longitude && meeting?.isInPerson) {
        const coords = meeting.latitude + ',' + meeting.longitude;

        //create a new pin
        if (!locations.hasOwnProperty(coords)) {
          locations[coords] = {
            directions_url: formatDirectionsUrl(meeting),
            formatted_address: meeting.formatted_address,
            latitude: meeting.latitude,
            longitude: meeting.longitude,
            meetings: [],
            name: meeting.location,
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

    //show popup if only one
    if (locationKeys.length === 1) {
      setPopup(locationKeys[0]);
    }
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
      {viewport && !!data.locationKeys.length && (
        <ReactMapGL
          mapStyle={settings.map.style}
          mapboxApiAccessToken={mapbox}
          onViewportChange={setViewport}
          {...viewport}
        >
          {data.locationKeys.map(key => (
            <div key={key}>
              <Marker
                latitude={data.locations[key].latitude}
                longitude={data.locations[key].longitude}
                offsetLeft={-settings.map.markers.location.width / 2}
                offsetTop={-settings.map.markers.location.height}
              >
                <div
                  data-testid={key}
                  onClick={() => setPopup(key)}
                  style={settings.map.markers.location}
                  title={data.locations[key].name}
                />
              </Marker>
              {popup === key && (
                <Popup
                  captureScroll={true}
                  closeOnClick={false}
                  latitude={data.locations[key].latitude}
                  longitude={data.locations[key].longitude}
                  offsetTop={-settings.map.markers.location.height}
                  onClose={() => setPopup(null)}
                >
                  <div className="d-grid gap-2">
                    <h4 className="fw-light">{data.locations[key].name}</h4>
                    <p>{data.locations[key].formatted_address}</p>
                    {listMeetingsInPopup && (
                      <div className="list-group mb-1">
                        {data.locations[key].meetings
                          .sort((a, b) => a.start > b.start)
                          .map((meeting, index) => (
                            <div key={index} className="list-group-item">
                              <time className="d-block">
                                {meeting.start.toFormat('t')}
                                <span className="ms-1">
                                  {meeting.start.toFormat('cccc')}
                                </span>
                              </time>
                              <Link
                                meeting={meeting}
                                setState={setState}
                                state={state}
                              />
                            </div>
                          ))}
                      </div>
                    )}
                    {data.locations[key].directions_url && (
                      <Button
                        className="in-person"
                        href={data.locations[key].directions_url}
                        icon="geo"
                        text={strings.get_directions}
                      />
                    )}
                  </div>
                </Popup>
              )}
            </div>
          ))}
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
