export type Index = {
  key: string;
  name: string;
  slugs: string[];
  children: Index[];
};

export type State = {
  alert?: 'no_results' | 'not_found';
  error?: 'bad_data' | 'no_data_src';
  indexes: {
    time: Index[];
    distance: Index[];
    region: Index[];
    weekday: Index[];
    type: Index[];
  };
  input: {
    search?: string;
    time: string[];
    distance: string[];
    region: string[];
    weekday: string[];
    type: string[];
  };
};
