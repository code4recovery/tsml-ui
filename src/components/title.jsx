import React from 'react';

import { strings } from '../settings';

export default function Title(props) {
  let title = [strings.meetings];
  if (props.state.input) {
    if (props.state.indexes.type.length && props.state.input.type.length) {
      title.unshift(
        props.state.input.type
          .map(x => {
            const value = props.state.indexes.type.find(y => y.key == x);
            return value ? value.name : '';
          })
          .join(' + ')
      );
    }
    if (props.state.indexes.time.length && props.state.input.time.length) {
      title.unshift(
        props.state.input.time
          .map(x => {
            const value = props.state.indexes.time.find(y => y.key == x);
            return value ? value.name : '';
          })
          .join(' + ')
      );
    }
    if (props.state.indexes.day.length && props.state.input.day.length) {
      title.unshift(
        props.state.input.day
          .map(x => {
            const value = props.state.indexes.day.find(y => y.key == x);
            return value ? value.name : '';
          })
          .join(' + ')
      );
    }
    if (props.state.indexes.region.length && props.state.input.region.length) {
      title.push(strings.in);
      title.push(
        props.state.input.region
          .map(x => {
            const value = props.state.indexes.region.find(y => y.key == x);
            return value ? value.name : '';
          })
          .join(' + ')
      );
    }
    if (props.state.input.search.length) {
      title.push(strings.with);
      title.push('‘' + props.state.input.search + '’');
    }
  }
  title = title.join(' ');
  document.title = title;
  return <h1 className="font-weight-light pb-1">{title}</h1>;
}
