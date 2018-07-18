import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import data from './data.json';

class TableBody extends Component {
	constructor() {
		super();

		//define current filters
		const date = new Date();
		this.state = {
			filters: {
				day: date.getDay(),
			},
		}
	}
	render() {
		const filters = this.state.filters;
		return (
			data.map(function(meeting){

				//check to see if result matches filters
				if (meeting.day != filters.day) return;

				//format results
				meeting.address = meeting.formatted_address.split(', ');
				meeting.address = meeting.address.length ? meeting.address[0] : '';

				return <tr key={meeting.slug}>
					<td className="d-block d-sm-table-cell time">{meeting.time_formatted}</td>
					<td className="d-block d-sm-table-cell name"><a href="{meeting.url}">{meeting.name}</a></td>
					<td className="d-block d-sm-table-cell location">{meeting.location}</td>
					<td className="d-block d-sm-table-cell address">{meeting.address}</td>
					<td className="d-block d-sm-table-cell region">{meeting.region}</td>
				</tr>
			})
		);
	}
}
 
ReactDOM.render(<TableBody/>, document.getElementById('table-body'));