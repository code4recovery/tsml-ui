import React from 'react';

import renderer from 'react-test-renderer';

import Loading from '../../src/components/Loading';

test('<Loading />', () => {
  const tree = renderer.create(<Loading />).toJSON();
  expect(tree).toMatchSnapshot();
});
