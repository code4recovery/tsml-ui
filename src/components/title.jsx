import React, { Component } from 'react';

import settings from '../settings';

export default class Title extends Component {
	render() {
		let title = [settings.strings.meetings];
		if (this.props.state.filters) {
			if (this.props.state.indexes.types.length && this.props.state.filters.types.length) {
				title.unshift(this.props.state.filters.types.map(x => {
					return this.props.state.indexes.types.find(y => y.key == x).name;
				}).join(' + '));
			}
			if (this.props.state.indexes.times.length && this.props.state.filters.times.length) {
				title.unshift(this.props.state.filters.times.map(x => {
					return this.props.state.indexes.times.find(y => y.key == x).name;
				}).join(' + '));
			}
			if (this.props.state.indexes.days.length && this.props.state.filters.days.length) {
				title.unshift(this.props.state.filters.days.map(x => {
					return this.props.state.indexes.days.find(y => y.key == x).name;
				}).join(' + '));
			}
			if (this.props.state.indexes.regions.length && this.props.state.filters.regions.length) {
				title.push(settings.strings.in);
				title.push(this.props.state.filters.regions.map(x => {
					return this.props.state.indexes.regions.find(y => y.key == x).name;
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