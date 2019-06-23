//quick format time function
export default function FormatTime(time) {
	if (time == null || time.length == 0) return null;
	let [ hours, minutes ] = time.split(':');
	let ampm = 'am';
	hours = parseInt(hours);
	if (hours == 0) {
		hours = 12;
	} else if (hours > 11) {
		if (hours == 12 && minutes == '00') return 'Noon'; 
		if (hours == 23 && minutes == '59') return 'Mid';
		ampm = 'pm';
		if (hours > 12) hours -= 12;
	}
	return hours + ':' + minutes + ' ' + ampm;
}
