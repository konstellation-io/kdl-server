import ActionsBar from './ActionsBar';
import React from 'react';
import { shallow } from 'enzyme';

const component = shallow(
  <ActionsBar className="some-class">
    <div id="child-1">Child 1</div>
    <div id="child-2">Child 2</div>
  </ActionsBar>
);

describe('ActionsBar component', () => {
  test('Component match snapshot', () => {
    expect(component).toMatchSnapshot();
  });
});
