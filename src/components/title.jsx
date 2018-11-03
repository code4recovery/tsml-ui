import React, { Component } from 'react';

import settings from '../settings';

export default class Title extends Component {
	render() {
		let title = [settings.strings.meetings];
		if (this.props.state.input) {
			if (this.props.state.indexes.types.length && this.props.state.input.types.length) {
				title.unshift(this.props.state.input.types.map(x => {
					return this.props.state.indexes.types.find(y => y.key == x).name;
				}).join(' + '));
			}
			if (this.props.state.indexes.times.length && this.props.state.input.times.length) {
				title.unshift(this.props.state.input.times.map(x => {
					return this.props.state.indexes.times.find(y => y.key == x).name;
				}).join(' + '));
			}
			if (this.props.state.indexes.days.length && this.props.state.input.days.length) {
				title.unshift(this.props.state.input.days.map(x => {
					return this.props.state.indexes.days.find(y => y.key == x).name;
				}).join(' + '));
			}
			if (this.props.state.indexes.regions.length && this.props.state.input.regions.length) {
				title.push(settings.strings.in);
				title.push(this.props.state.input.regions.map(x => {
					return this.props.state.indexes.regions.find(y => y.key == x).name;
				}).join(' + '));
			}
			if (this.props.state.input.search.length) {
				title.push(settings.strings.with);
				title.push('‘' + this.props.state.input.search + '’');
			}
		}
		title = title.join(' ');
		document.title = title;
		return(
			<h1 className="d-none d-sm-block mt-3 mb-0">{title}</h1>
		);
	}
}