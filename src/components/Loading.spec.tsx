import renderer from 'react-test-renderer';
import Loading from './Loading';

test('<Loading />', () => {
  const tree = renderer.create(<Loading />).toJSON();
  expect(tree).toMatchSnapshot();
});
