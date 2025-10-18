import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

import { formatString, getDistance } from '../helpers';
import { Index, Meeting } from '../types';

import { useError } from './error';
import { useInput } from './input';
import { useSettings } from './settings';

type LocationState = {
  latitude?: number;
  longitude?: number;
  waitingForLocation: boolean;
};

type LocationContextType = LocationState & {
  calculateDistances: (_meetings: { [index: string]: Meeting }) => {
    meetings: { [index: string]: Meeting };
    distanceIndex: Index[];
    hasDistance: boolean;
  };
  setBounds: (_bounds: {
    north: string;
    south: string;
    east: string;
    west: string;
  }) => void;
};

const defaultLocationState: LocationState = {
  waitingForLocation: false,
};

const LocationContext = createContext<LocationContextType>({
  ...defaultLocationState,
  calculateDistances: () => ({ meetings: {}, distanceIndex: [], hasDistance: false }),
  setBounds: () => {},
});

export const useLocation = () => useContext(LocationContext);

export const LocationProvider = ({ children }: PropsWithChildren) => {
  const { setError } = useError();
  const { input } = useInput();
  const { settings, strings } = useSettings();
  const [bounds, setBounds] = useState({
    north: '',
    south: '',
    east: '',
    west: '',
  });

  const [locationState, setLocationState] = useState<LocationState>(defaultLocationState);
  const [geocodedSearch, setGeocodedSearch] = useState<string>();


  // Handle geocoding or geolocation requests
  useEffect(() => {
    // Only proceed if we're in location or me mode
    if (input.mode !== 'location' && input.mode !== 'me') {
      setLocationState({ waitingForLocation: false });
      setGeocodedSearch(undefined);
      return;
    }
    
    // Don't re-trigger if we already have coordinates or are already waiting
    if (locationState.waitingForLocation) return;
    
    setError();
    
    if (input.mode === 'location' && input.search) {
      // Don't geocode the same search again
      if (geocodedSearch === input.search) return;
      
      // Wait for bounds to be available before geocoding
      // bounds will be set by DataProvider after meeting data is loaded
      if (!bounds.north && !bounds.south && !bounds.east && !bounds.west) {
        return;
      }

      setLocationState({ waitingForLocation: true });
      const url = window.location.hostname.endsWith('.test')
        ? 'geo.test'
        : 'geo.code4recovery.org';
      fetch(
        `https://${url}/api/geocode?${new URLSearchParams({
          application: 'tsml-ui',
          language: settings.language,
          referrer: window.location.href,
          search: input.search,
          ...bounds,
        })}`
      )
        .then(result => result.json())
        .then(({ results }) => {
          if (!results?.length) {
            throw new Error(
              formatString(strings.errors.geocoding, { address: input.search })
            );
          }
          const { geometry } = results[0];
          setLocationState({
            latitude: geometry.location.lat,
            longitude: geometry.location.lng,
            waitingForLocation: false,
          });
          setGeocodedSearch(input.search);
        })
        .catch(e => {
          setError(String(e));
          setLocationState({
            latitude: undefined,
            longitude: undefined,
            waitingForLocation: false,
          });
          setGeocodedSearch(input.search);
        });
    } else if (input.mode === 'me') {
      setLocationState({ waitingForLocation: true });
      setError();
      navigator.geolocation.getCurrentPosition(
        position => {
          setLocationState({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            waitingForLocation: false,
          });
        },
        () => {
          setError(strings.errors.geolocation);
          setLocationState({
            waitingForLocation: false,
          });
        },
        { timeout: 5000 }
      );
    } else {
      setLocationState({ waitingForLocation: false });
    }
  }, [input.mode, input.search, bounds.north]);

  const calculateDistances = useCallback((meetings: { [index: string]: Meeting }) => {
    const { latitude, longitude } = locationState;
    
    if (!latitude || !longitude) {
      return { meetings, distanceIndex: [], hasDistance: false };
    }

    const distances = Object.fromEntries(
      settings.distance_options.map(option => [option, []])
    );

    const updatedMeetings = { ...meetings };

    Object.keys(updatedMeetings).forEach(slug => {
      const meeting = updatedMeetings[slug];
      if (meeting.latitude && meeting.longitude) {
        meeting.distance = getDistance(
          { latitude, longitude },
          meeting,
          settings
        );
      }

      for (const option of settings.distance_options) {
        if (meeting.distance && meeting.distance <= option) {
          (distances[option] as string[]).push(meeting.slug);
        }
      }
    });

    const distanceIndex: Index[] = Object.entries(distances).map(([key, slugs]) => ({
      key,
      name: `${key} ${settings.distance_unit}`,
      slugs,
    }));

    return {
      meetings: updatedMeetings,
      distanceIndex,
      hasDistance: true,
    };
  }, [locationState.latitude, locationState.longitude, settings.distance_options, settings.distance_unit]);

  const contextValue: LocationContextType = {
    ...locationState,
    calculateDistances,
    setBounds,
  };

  return (
    <LocationContext.Provider value={contextValue}>
      {children}
    </LocationContext.Provider>
  );
};
