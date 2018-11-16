import React, { Component } from 'react';
import classNames from 'classnames/bind';

import { settings, strings } from '../settings';

export default class Title extends Component {
	render() {
		let title = [strings.meetings];
		if (this.props.state.input) {
			if (this.props.state.indexes.type.length && this.props.state.input.type.length) {
				title.unshift(this.props.state.input.type.map(x => {
					return this.props.state.indexes.type.find(y => y.key == x).name;
				}).join(' + '));
			}
			if (this.props.state.indexes.time.length && this.props.state.input.time.length) {
				title.unshift(this.props.state.input.time.map(x => {
					return this.props.state.indexes.time.find(y => y.key == x).name;
				}).join(' + '));
			}
			if (this.props.state.indexes.day.length && this.props.state.input.day.length) {
				title.unshift(this.props.state.input.day.map(x => {
					return this.props.state.indexes.day.find(y => y.key == x).name;
				}).join(' + '));
			}
			if (this.props.state.indexes.region.length && this.props.state.input.region.length) {
				title.push(strings.in);
				title.push(this.props.state.input.region.map(x => {
					return this.props.state.indexes.region.find(y => y.key == x).name;
				}).join(' + '));
			}
			if (this.props.state.input.search.length) {
				title.push(strings.with);
				title.push('‘' + this.props.state.input.search + '’');
			}
		}
		title = title.join(' ');
		document.title = title;
		return(
			<h1 className={classNames('font-weight-light', { 
				'd-none': !settings.defaults.title || this.props.state.input.meeting || this.props.state.loading
			})}>{title}</h1>
		);
	}
}