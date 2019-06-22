// Returns a Promise that resolves to MG formatted JSON - you can add your own script for custom formats/data sources
export function fetchData(element){
  	var altsrcPromise = new Promise(function(resolve, reject) {
    	resolve(datatojson_MGFormat_GoogleSheet());
  	});
  	return altsrcPromise;

	// Script to generate MG formatted JSON from a MG Format Google Sheet
	async function datatojson_MGFormat_GoogleSheet(){
		// Cateret County Example - https://github.com/meeting-guide/spreadsheet
		// https://docs.google.com/spreadsheets/d/e/2PACX-1vQJ5OsDCKSDEvWvqM_Z6tmXe4N-VYEnEAfvU5PX5QXZjHVbnrX-aeiyhWnZp0wpWtOmWjO4L5GJtfFu/pubhtml
		// gs_id: 1prbiXHu9JS5eREkYgBQkxlkJELRHqrKz6-_PLGPWIWk
		// JSON: https://spreadsheets.google.com/feeds/list/1prbiXHu9JS5eREkYgBQkxlkJELRHqrKz6-_PLGPWIWk/1/public/values?alt=json
		const googleSheetID = element.getAttribute('gs_id');
		const googlesheetURL = 'https://spreadsheets.google.com/feeds/list/'+googleSheetID+'/1/public/values?alt=json';
		const data = await fetch(googlesheetURL).then(result => {return result.json()});
		let meetings = [];
		for (let i = 0; i < data.feed.entry.length; i++) {
			let meeting = {};
			const meetingKeys = Object.keys(data.feed.entry[i])
			for (let j= 0; j < meetingKeys.length; j++) {
				if (meetingKeys[j].substr(0,4) == 'gsx$') {
					meeting[meetingKeys[j].substr(4)] = data.feed.entry[i][meetingKeys[j]]['$t'];
				}
			}
			if (meeting.time && meeting.name && meeting.day && (meeting.address || meeting.formatted_address)) {
				meetings.push(meeting);
			}
		}
		return meetings;

		// create slug if not
		// deal with time format
		// deal with day format
		// deal with types format
	}
}