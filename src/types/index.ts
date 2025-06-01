export * from './JSONData';
export * from './MapLocation';
export * from './Meeting';
export * from './MetaType';
export * from './Translation';

export type Index = {
  key: string;
  name: string;
  slugs: string[];
  children?: Index[];
};
