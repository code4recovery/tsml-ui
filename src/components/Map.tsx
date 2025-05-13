import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';

import { formatDirectionsUrl, useSettings } from '../helpers';
import { mapCss, mapPopupMeetingsCss } from '../styles';

import Button from './Button';
import Link from './Link';

import type { Meeting, State } from '../types';

import {
  MapContainer,
  TileLayer,
  Marker as LeafletMarker,
  Popup as LeafletPopup,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

type MapLocation = {
  directions_url: string;
  formatted_address: string;
  latitude: number;
  longitude: number;
  meetings: Meeting[];
  name?: string;
};

type Locations = {
  [index: string]: MapLocation;
};

export default function Map({
  filteredSlugs,
  listMeetingsInPopup = true,
  state,
  setState,
}: {
  filteredSlugs: string[];
  listMeetingsInPopup: boolean;
  setState: Dispatch<SetStateAction<State>>;
  state: State;
}) {
  const [data, setData] = useState<{
    locations: Locations;
    locationKeys: string[];
  }>({
    locations: {},
    locationKeys: [],
  });
  const { settings } = useSettings();

  // reset locations when filteredSlugs changes
  useEffect(() => {
    const locations: Locations = {};
    filteredSlugs.forEach(slug => {
      const meeting = state.meetings[slug];

      if (meeting?.latitude && meeting?.longitude && meeting?.isInPerson) {
        const coords = meeting.latitude + ',' + meeting.longitude;

        // create a new pin
        if (!locations[coords]) {
          locations[coords] = {
            directions_url: formatDirectionsUrl(meeting),
            formatted_address: meeting.formatted_address,
            latitude: meeting.latitude,
            longitude: meeting.longitude,
            meetings: [],
            name: meeting.location,
          };
        }

        // add meeting to pin
        locations[coords].meetings.push(meeting);
      }
    });

    // quick reference array (sort so southern pins appear in front)
    const locationKeys = Object.keys(locations).sort(
      (a, b) => locations[b].latitude - locations[a].latitude
    );

    setData({
      locations,
      locationKeys,
    });
  }, [filteredSlugs]);

  return (
    <div aria-hidden={true} css={mapCss}>
      {!!data.locationKeys.length && (
        <MapContainer
          style={{ height: '100%', width: '100%' }}
          zoomControl={!('ontouchstart' in window || !!window.TouchEvent)}
        >
          <TileLayer {...settings.map.tiles} />
          <Markers
            {...data}
            listMeetingsInPopup={listMeetingsInPopup}
            state={state}
            setState={setState}
          />
        </MapContainer>
      )}
    </div>
  );
}

const Markers = ({
  listMeetingsInPopup,
  locations,
  locationKeys,
  state,
  setState,
}: {
  listMeetingsInPopup: boolean;
  locations: Locations;
  locationKeys: (keyof Locations)[];
  setState: Dispatch<SetStateAction<State>>;
  state: State;
}) => {
  const map = useMap();
  const { settings, strings } = useSettings();
  const markerRef = useRef(null);
  const markerIcon = L.divIcon({
    className: 'tsml-ui-marker',
    html: settings.map.markers.location.html,
    iconAnchor: [
      settings.map.markers.location.width / 2,
      settings.map.markers.location.height / 2,
    ],
    iconSize: new L.Point(
      settings.map.markers.location.width,
      settings.map.markers.location.height
    ),
  });

  useEffect(() => {
    if (locationKeys.length === 1) {
      map.setView(
        [
          locations[locationKeys[0]].latitude,
          locations[locationKeys[0]].longitude,
        ],
        16
      );
      // @ts-ignore
      markerRef.current?.openPopup();
    } else {
      const latitudes = locationKeys.map(key => locations[key].latitude);
      const longitudes = locationKeys.map(key => locations[key].longitude);
      map.fitBounds([
        [Math.max(...latitudes), Math.min(...longitudes)],
        [Math.min(...latitudes), Math.max(...longitudes)],
      ]);
    }
  }, [locations, locationKeys]);

  return locationKeys.map(key => (
    <LeafletMarker
      key={key}
      position={[locations[key].latitude, locations[key].longitude]}
      ref={markerRef}
      icon={markerIcon}
    >
      <LeafletPopup>
        <h2>{locations[key].name}</h2>
        <p className="notranslate">{locations[key].formatted_address}</p>
        {listMeetingsInPopup && (
          <div css={mapPopupMeetingsCss}>
            {locations[key].meetings
              .sort((a, b) => (a.start && b.start && a.start > b.start ? 1 : 0))
              .map((meeting, index) => (
                <div key={index}>
                  <time>
                    {meeting.start?.toFormat('t')}
                    <span>{meeting.start?.toFormat('cccc')}</span>
                  </time>
                  <Link meeting={meeting} setState={setState} state={state} />
                </div>
              ))}
          </div>
        )}
        {locations[key].directions_url && (
          <Button
            href={locations[key].directions_url}
            icon="geo"
            text={strings.get_directions}
            type="in-person"
          />
        )}
      </LeafletPopup>
    </LeafletMarker>
  ));
};
