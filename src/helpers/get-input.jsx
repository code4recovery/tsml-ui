import qs from 'query-string';
import { settings } from '../settings';

export default function GetInput(queryString) {

    let input = {
        center: null,
        day: [],
        district: [],
        meeting: null,
        mode: settings.defaults.mode,
        query: null,
        radius: null,
        region: [],
        search: '',
        time: [],
        type: [],
        view: settings.defaults.view,
    }    

    //load input from query string
    let querystring = qs.parse(location.search);
    for (let i = 0; i < settings.filters.length; i++) {
        let filter = settings.filters[i];
        if (querystring[filter]) {
            if (filter == 'day' && querystring.day == 'any') {
                input.day = [];
            } else {
                input[filter] = querystring[filter].split('/');
            }
        }
    }
    for (let i = 0; i < settings.params.length; i++) {
        if (querystring[settings.params[i]]) {
            input[settings.params[i]] = querystring[settings.params[i]];
        }
    }
    if (querystring.meeting) {
        input.meeting = querystring.meeting;
    }

    //today mode
    if (!querystring.day && settings.defaults.today) {
        input.day.push(new Date().getDay());
    }

    return input;
}