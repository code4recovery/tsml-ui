// Returns a Promise that resolves to MG formatted JSON
export function fetchData(element){
  	var googlesheetPromise = new Promise(function(resolve, reject) {
    	resolve(datatojson());
  	});
  	return googlesheetPromise;

	// Script to generate MG formatted JSON from a MG Format Google Sheet
	async function datatojson(){
		// For example of MG Format Google Sheet see Cateret County Example on https://github.com/meeting-guide/spreadsheet
		// https://docs.google.com/spreadsheets/d/e/2PACX-1vQJ5OsDCKSDEvWvqM_Z6tmXe4N-VYEnEAfvU5PX5QXZjHVbnrX-aeiyhWnZp0wpWtOmWjO4L5GJtfFu/pubhtml
		// gs_id: 1prbiXHu9JS5eREkYgBQkxlkJELRHqrKz6-_PLGPWIWk
		// JSON: https://spreadsheets.google.com/feeds/list/1prbiXHu9JS5eREkYgBQkxlkJELRHqrKz6-_PLGPWIWk/1/public/values?alt=json
		
		// gets data from Google Sheet
		const googleSheetID = element.getAttribute('gs_id');
		const googlesheetURL = 'https://spreadsheets.google.com/feeds/list/'+googleSheetID+'/1/public/values?alt=json';
		const data = await fetch(googlesheetURL).then(result => {return result.json()});
		
		let meetings = [];

		// takes the Google Sheet data and properly formats it
		for (let i = 0; i < data.feed.entry.length; i++) {

			// creates a meeting object containing a property corresponding to each column header of the Google Sheet
			let meeting = {};
			const meetingKeys = Object.keys(data.feed.entry[i])
			for (let j= 0; j < meetingKeys.length; j++) {
				if (meetingKeys[j].substr(0,4) == 'gsx$') {
					meeting[meetingKeys[j].substr(4)] = data.feed.entry[i][meetingKeys[j]]['$t'];
				}
			}

			// adds a slug if none provided
			if (!meeting.slug) meeting.slug = i.toString();

			// if no region then sets city to be region for display purposes
			if (!meeting.region && meeting.city) meeting.region = meeting.city;

			// converts to 24hr time format
			let timeTemp = meeting.time.toLowerCase();
			if (timeTemp.includes('am')) {
				meeting.time =  timeTemp.substr(0, timeTemp.indexOf(' am'));
			}
			if (timeTemp.includes('pm')) {
				timeTemp = timeTemp.substr(0, timeTemp.indexOf(' pm'));
				let [ tempHours, tempMinutes ] = timeTemp.split(':');
				tempHours = parseInt(tempHours) + 12;
				meeting.time = tempHours + ':' + tempMinutes;
			}

			// if day is spelled out it sets it to the appropriate integer
			if (!Number.isInteger(meeting.day)) {
				switch (meeting.day.toLowerCase()) {
					case 'sunday':
						meeting.day = 0;
						break;
					case 'monday':
						meeting.day = 1;
						break;
					case 'tuesday':
						meeting.day = 2;
						break;
					case 'wednesday':
						meeting.day = 3;
						break;
					case 'thursday':
						meeting.day = 4;
						break;
					case 'friday':
						meeting.day = 5;
						break;
					case 'saturday':
						meeting.day = 6;
				}
			}

			// converts types from single string to array of codes
			let typesSplit = meeting.types.split(", ");
			let typesArray = [];
			for (let j = 0; j < typesSplit.length; j++) {
				switch (typesSplit[j].toLowerCase()) {
					case '11th step meditation':
					case '11':
						typesArray.push("11");
						break;
					case '12 steps and 12 traditions':
					case '12x12':
						typesArray.push("12x12");
						break;
					case 'as bill sees it':
					case 'absi':
						typesArray.push("ABSI");
					case 'babysitting available':
					case 'ba':
						typesArray.push("BA");
						break;
					case 'big book':
					case 'b':
						typesArray.push("B");
						break;
					case 'birthday':
					case 'h':
						typesArray.push("H");
						break;
					case 'breakfast':
					case 'brk':
						typesArray.push("BRK");
						break;
					case 'candlelight':
					case 'can':
						typesArray.push("CAN");
						break;
					case 'child-friendly':
					case 'cf':
						typesArray.push("CF");
						break;
					case 'closed':
					case 'c':
						typesArray.push("C");
						break;
					case 'concurrent with al-anon':
					case 'al-an':
						typesArray.push("AL-AN");
						break;
					case 'concurrent with alateen':
					case 'al':
						typesArray.push("AL");
						break;
					case 'cross talk permitted':
					case 'xt':
						typesArray.push("XT");
						break;
					case 'daily reflections':
					case 'dr':
						typesArray.push("DR");
						break;
					case 'digitial basket':
					case 'db':
						typesArray.push("DB");
						break;
					case 'discussion':
					case 'd':
						typesArray.push("D");
						break;
					case 'dual diagnosis':
					case 'dd':
						typesArray.push("DD");
						break;
					case 'english':
					case 'en':
						typesArray.push("EN");
						break;
					case 'fragrance free':
					case 'ff':
						typesArray.push("FF");
						break;
					case 'french':
					case 'fr':
						typesArray.push("FR");
						break;
					case 'gay':
					case 'g':
						typesArray.push("G");
						break;
					case 'grapevine':
					case 'gr':
						typesArray.push("GR");
						break;
					case 'indigenous':
					case 'ndg':
						typesArray.push("NDG");
						break;
					case 'italian':
					case 'ita':
						typesArray.push("ITA");
						break;
					case 'japanese':
					case 'ja':
						typesArray.push("JA");
						break;
					case 'korean':
					case 'kor':
						typesArray.push("KOR");
						break;
					case 'lesbian':
					case 'l':
						typesArray.push("L");
						break;
					case 'literature':
					case 'lit':
						typesArray.push("LIT");
						break;
					case 'living sober':
					case 'ls':
						typesArray.push("LS");
						break;
					case 'lgbtq':
						typesArray.push("LGBTQ");
						break;
					case 'meditation':
					case 'med':
						typesArray.push("MED");
						break;
					case 'men':
					case 'm':
						typesArray.push("M");
						break;
					case 'native american':
					case 'n':
						typesArray.push("N");
						break;
					case 'newcomer':
					case 'be':
						typesArray.push("BE");
						break;
					case 'non-smoking':
					case 'ns':
						typesArray.push("NS");
						break;
					case 'open':
					case 'o':
						typesArray.push("O");
						break;
					case 'people of color':
					case 'poc':
						typesArray.push("POC");
						break;
					case 'polish':
					case 'pol':
						typesArray.push("POL");
						break;
					case 'portuguese':
					case 'por':
						typesArray.push("POR");
						break;
					case 'professionals':
					case 'p':
						typesArray.push("P");
						break;
					case 'punjabi':
					case 'pun':
						typesArray.push("PUN");
						break;
					case 'russian':
					case 'rus':
						typesArray.push("RUS");
						break;
					case 'secular':
					case 'a':
						typesArray.push("A");
						break;
					case 'sign language':
					case 'asl':
						typesArray.push("ASL");
						break;
					case 'smoking permitted':
					case 'sm':
						typesArray.push("SM");
						break;
					case 'spanish':
					case 's':
						typesArray.push("S");
						break;
					case 'speaker':
					case 'sp':
						typesArray.push("SP");
						break;
					case 'step meeting':
					case 'st':
						typesArray.push("ST");
						break;
					case 'tradition study':
					case 'tr':
						typesArray.push("TR");
						break;
					case 'transgender':
					case 't':
						typesArray.push("T");
						break;
					case 'wheelchair access':
					case 'x':
						typesArray.push("X");
						break;
					case 'wheelchair-Accessible Bathroom':
					case 'xb':
						typesArray.push("XB");
						break;
					case 'women':
					case 'w':
						typesArray.push("W");
						break;
					case 'young people':
					case 'y':
						typesArray.push("Y");
				}
			}
			meeting.types = typesArray;
	
			meetings.push(meeting);
		}
		
		return meetings;
	}
}