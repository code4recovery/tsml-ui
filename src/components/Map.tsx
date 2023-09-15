import { useEffect, useRef, useState } from 'react';
import ReactMapGL, { Marker, NavigationControl, Popup } from 'react-map-gl';
import WebMercatorViewport from 'viewport-mercator-project';

import type { Meeting, State } from '../types';
import { formatDirectionsUrl, useSettings } from '../helpers';
import Button from './Button';
import Link from './Link';

type MapProps = {
  filteredSlugs: string[];
  listMeetingsInPopup: boolean;
  mapbox?: string;
  setState: (state: State) => void;
  state: State;
};

type Locations = {
  [index: string]: {
    directions_url: string;
    formatted_address: string;
    latitude: number;
    longitude: number;
    meetings: Meeting[];
    name?: string;
  };
};

type Bounds = {
  north?: number;
  east?: number;
  south?: number;
  west?: number;
};

type Viewport = {
  width: number;
  height: number;
  zoom: number;
  latitude: number;
  longitude: number;
};

export default function Map({
  filteredSlugs,
  listMeetingsInPopup = true,
  state,
  setState,
  mapbox,
}: MapProps) {
  const { settings, strings } = useSettings();
  const [popup, setPopup] = useState<string | undefined>();
  const [viewport, setViewport] = useState<Viewport | undefined>();
  const [data, setData] = useState<{
    locations: Locations;
    bounds: Bounds;
    locationKeys: string[];
  }>({
    locations: {},
    bounds: {},
    locationKeys: [],
  });
  const [dimensions, setDimensions] = useState<{
    width: number;
    height: number;
  }>();
  const mapFrame = useRef<HTMLDivElement>(null);

  //window size listener (todo figure out why height can go up but not down)
  useEffect(() => {
    const resizeListener = () => {
      if (!mapFrame.current) return;
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

  //reset bounds and locations when filteredSlugs changes
  useEffect(() => {
    const locations: Locations = {};
    const bounds: Bounds = {};

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
    const locationKeys: string[] = Object.keys(locations).sort(
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
    if (
      !dimensions ||
      !data.bounds ||
      !data.bounds.north ||
      !data.bounds.east ||
      !data.bounds.south ||
      !data.bounds.west
    )
      return;
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
    <div aria-hidden={true} ref={mapFrame}>
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
                  onClose={() => setPopup(undefined)}
                >
                  <div>
                    <h2>{data.locations[key].name}</h2>
                    <p>{data.locations[key].formatted_address}</p>
                    {listMeetingsInPopup && (
                      <div>
                        {data.locations[key].meetings
                          .sort((a, b) =>
                            a.start && b.start && a.start > b.start ? 1 : 0
                          )
                          .map((meeting, index) => (
                            <div key={index}>
                              <time>
                                {meeting.start?.toFormat('t')}
                                <span>{meeting.start?.toFormat('cccc')}</span>
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
            onViewportChange={setViewport}
            showCompass={false}
            style={{ top: 10, right: 10 }}
          />
        </ReactMapGL>
      )}
    </div>
  );
}
