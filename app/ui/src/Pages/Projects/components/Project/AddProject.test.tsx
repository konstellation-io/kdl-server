import React from 'react';
import AddProject from './AddProject';
import { shallow } from 'enzyme';

const component = shallow(<AddProject />);

describe('AddProject component', () => {
  test('Component match snapshot', () => {
    expect(component).toMatchSnapshot();
  });
});
