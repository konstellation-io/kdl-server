import * as React from 'react';
import ProjectsBar from './ProjectsBar';
import { shallow } from 'enzyme';

const component = shallow(<ProjectsBar />);

describe('ProjectsBar component', () => {
  test('Component match snapshot', () => {
    expect(component).toMatchSnapshot();
  });
});
