import { strings } from '../settings';

//quick format time function
export default function FormatTime(time) {

	//check that string is HH:MM
	if (!time || time.length !== 5 || time.substr(2, 1) !== ':') return null;

	//get hours and minutes
	const [ hours, minutes ] = time.split(':');

	//check for times with special names
	if (hours == '12' && minutes == '00') {
		return strings.noon;
	} else if (
		(hours == '00' && minutes == '00') || 
		(hours == '23' && minutes == '59') || 
		(hours == '24' && minutes == '00')
	) {
		return strings.midnight;
	}

	//create a date object
	let date = new Date();
	date.setHours(parseInt(hours));
	date.setMinutes(parseInt(minutes));
	return date.toLocaleTimeString([], {
		hour: '2-digit',
		minute:'2-digit'
	});
}
