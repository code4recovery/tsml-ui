import React, { Component } from 'react';

import settings from '../settings';

export default class Title extends Component {
	render() {
		let title = [settings.strings.meetings];
		if (this.props.filters) {
			if (this.props.indexes.types.length && this.props.filters.types.length) {
				title.unshift(this.props.filters.types.map(x => {
					return this.props.indexes.types.find(y => y.key == x).name;
				}).join(' + '));
			}
			if (this.props.indexes.times.length && this.props.filters.times.length) {
				title.unshift(this.props.filters.times.map(x => {
					return this.props.indexes.times.find(y => y.key == x).name;
				}).join(' + '));
			}
			if (this.props.indexes.days.length && this.props.filters.days.length) {
				title.unshift(this.props.filters.days.map(x => {
					return this.props.indexes.days.find(y => y.key == x).name;
				}).join(' + '));
			}
			if (this.props.indexes.regions.length && this.props.filters.regions.length) {
				title.push(settings.strings.in);
				title.push(this.props.filters.regions.map(x => {
					return this.props.indexes.regions.find(y => y.key == x).name;
				}).join(' + '));
			}
		}
		title = title.join(' ');
		document.title = title;
		return(
			<h1 className="d-none d-sm-block mt-4">{title}</h1>
		);
	}
}