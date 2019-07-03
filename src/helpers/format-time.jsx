import { strings } from '../settings';

//quick format time function
export default function FormatTime(time) {
	if (time == null || time.length == 0) return null;

	let date = new Date();
	const [ hours, minutes ] = time.split(':');

	if (hours == '12' && minutes == '00') return strings.noon;
	if (
		(hours == '00' && minutes == '00') || 
		(hours == '23' && minutes == '59') || 
		(hours == '24' && minutes == '00')
	) return strings.midnight;

	date.setHours(parseInt(hours));
	date.setMinutes(parseInt(minutes));
	return date.toLocaleTimeString([], {
		hour: '2-digit',
		minute:'2-digit'
	});
}
