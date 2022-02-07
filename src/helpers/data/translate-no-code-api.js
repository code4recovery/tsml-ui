//translate result from nocodeapi.com (used by airtable instances)
export function translateNoCodeAPI(data) {
  return data.records
    ? data.records.map(record => ({
        ...record.fields,
        time: moment(record.fields.time, 'h:mm a').format('HH:mm'),
        types: record.fields.types
          ? record.fields.types.split(',').map(type => type.trim())
          : [],
      }))
    : data;
}
