export type JSONData = {
  address?: string;
  approximate?: string | boolean;
  city?: string;
  conference_phone?: string;
  conference_phone_notes?: string;
  conference_url?: string;
  conference_url_notes?: string;
  contact_1_email?: string;
  contact_1_name?: string;
  contact_1_phone?: string;
  contact_2_email?: string;
  contact_2_name?: string;
  contact_2_phone?: string;
  contact_3_email?: string;
  contact_3_name?: string;
  contact_3_phone?: string;
  coordinates?: string;
  country?: string;
  day?: string | number | string[] | number[];
  district?: string;
  edit_url?: string;
  email?: string;
  end_time?: string;
  entity?: string;
  entity_location?: string;
  entity_phone?: string;
  entity_url?: string;
  feedback_emails?: string;
  feedback_url?: string;
  formatted_address?: string;
  group?: string;
  group_notes?: string;
  homegroup_online?: string;
  latitude?: string | number;
  location?: string;
  location_notes?: string;
  longitude?: string | number;
  name?: string;
  notes?: string;
  paypal?: string;
  phone?: string;
  postal_code?: string;
  region?: string;
  regions?: string[];
  slug?: string;
  square?: string;
  state?: string;
  sub_region?: string;
  sub_sub_region?: string;
  time?: string;
  timezone?: string;
  types?: number[] | string[];
  updated?: string;
  url?: string;
  venmo?: string;
  website?: string;
};

export type JSONDataFlat = JSONData & {
  day?: number;
};
