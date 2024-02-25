export type Index = {
  key: string;
  name: string;
  slugs: string[];
  children?: Index[];
};
