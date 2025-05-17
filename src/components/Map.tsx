import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';

import { formatDirectionsUrl, useSettings } from '../helpers';
import { mapCss, mapPopupMeetingsCss } from '../styles';

import Button from './Button';
import Link from './Link';

import type { MapLocation, State } from '../types';

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function Map({
  filteredSlugs,
  listMeetingsInPopup = true,
  setState,
  state,
}: {
  filteredSlugs: string[];
  listMeetingsInPopup: boolean;
  setState: Dispatch<SetStateAction<State>>;
  state: State;
}) {
  const [locations, setLocations] = useState<MapLocation[]>([]);
  const { settings } = useSettings();
  const [darkMode, setDarkMode] = useState(
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );
  const { latitude, longitude, mode } = state.input;

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = ({ matches }: MediaQueryListEvent) => {
      setDarkMode(matches);
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  // reset locations when filteredSlugs changes
  useEffect(() => {
    const locations: { [index: string]: MapLocation } = {};
    filteredSlugs.forEach(slug => {
      const meeting = state.meetings[slug];

      if (meeting?.latitude && meeting?.longitude && meeting?.isInPerson) {
        const coords = meeting.latitude + ',' + meeting.longitude;

        // create a new pin
        if (!locations[coords]) {
          locations[coords] = {
            directions_url: formatDirectionsUrl(meeting),
            formatted_address: meeting.formatted_address,
            key: coords,
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
    setLocations(
      Object.values(locations).sort((a, b) => a.latitude - b.latitude)
    );
  }, [filteredSlugs]);

  return (
    <div aria-hidden={true} css={mapCss}>
      {!!locations.length && (
        <MapContainer
          style={{ height: '100%', width: '100%' }}
          zoomControl={!('ontouchstart' in window || !!window.TouchEvent)}
        >
          <TileLayer
            {...(settings.map.tiles_dark && darkMode
              ? settings.map.tiles_dark
              : settings.map.tiles)}
          />
          <Markers
            listMeetingsInPopup={listMeetingsInPopup}
            locations={locations}
            state={state}
            setState={setState}
          />
          {latitude && longitude && mode === 'location' && (
            <Marker
              icon={mapMarkerIcon(settings.map.markers.geocode)}
              position={[latitude, longitude]}
            />
          )}
          {latitude && longitude && mode === 'me' && (
            <Marker
              icon={mapMarkerIcon(settings.map.markers.geolocation)}
              position={[latitude, longitude]}
            />
          )}
        </MapContainer>
      )}
    </div>
  );
}

const Markers = ({
  listMeetingsInPopup,
  locations,
  state,
  setState,
}: {
  listMeetingsInPopup: boolean;
  locations: MapLocation[];
  setState: Dispatch<SetStateAction<State>>;
  state: State;
}) => {
  const map = useMap();
  const { settings, strings } = useSettings();
  const markerRef = useRef<L.Marker>(null);
  const markerIcon = mapMarkerIcon(settings.map.markers.location);

  useEffect(() => {
    if (locations.length === 1) {
      map.setView([locations[0].latitude, locations[0].longitude], 16);
      markerRef.current?.openPopup();
    } else {
      const latitudes = locations.map(({ latitude }) => latitude);
      const longitudes = locations.map(({ longitude }) => longitude);
      map.fitBounds(
        [
          [Math.max(...latitudes), Math.min(...longitudes)],
          [Math.min(...latitudes), Math.max(...longitudes)],
        ],
        { padding: [10, 10] }
      );
    }
  }, [locations]);

  return locations.map(location => (
    <Marker
      key={location.key}
      position={[location.latitude, location.longitude]}
      ref={locations.length === 1 ? markerRef : null}
      icon={markerIcon}
    >
      <Popup>
        <h2>{location.name}</h2>
        <p className="notranslate">{location.formatted_address}</p>
        {listMeetingsInPopup && (
          <div css={mapPopupMeetingsCss}>
            {location.meetings
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
        {location.directions_url && (
          <Button
            href={location.directions_url}
            icon="geo"
            text={strings.get_directions}
            type="in-person"
          />
        )}
      </Popup>
    </Marker>
  ));
};

const mapMarkerIcon = ({ height, html, width }: MapMarker) =>
  L.divIcon({
    className: 'tsml-ui-marker',
    html,
    iconAnchor: [width / 2, height / 2],
    iconSize: new L.Point(width, height),
  });
