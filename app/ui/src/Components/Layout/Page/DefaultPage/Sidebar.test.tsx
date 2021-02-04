import React from 'react';
import Sidebar from './Sidebar';
import { shallow } from 'enzyme';

const component = shallow(
  <Sidebar title="Some title" subtitle="Some subtitle" />
);

describe('Sidebar component', () => {
  test('Component match snapshot', () => {
    expect(component).toMatchSnapshot();
  });

  it('show right texts', () => {
    expect(component.contains('Some title')).toBeTruthy();
    expect(component.contains('Some subtitle')).toBeTruthy();
  });
});
