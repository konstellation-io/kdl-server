import Panel, { PANEL_SIZE } from './Panel';

import { Button } from 'kwc';
import * as React from 'react';
import { shallow } from 'enzyme';

const onCloseMock = jest.fn();

const component = shallow(
  <Panel title="Some title" show={true} close={onCloseMock} size={PANEL_SIZE.DEFAULT} noShrink={true} dark={false}>
    <div>Children</div>
  </Panel>,
);

describe('Panel component', () => {
  test('Component match snapshot', () => {
    expect(component).toMatchSnapshot();
  });

  it('show right texts', () => {
    // Arrange.
    // Act.
    // Assert.
    expect(component.contains('Some title')).toBeTruthy();
  });

  it('handles events', () => {
    // Arrange.
    // Act.
    component.find(Button).simulate('click');

    // Assert.
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it('hides content when closed', () => {
    // Arrange.
    // Act.
    component.setProps({ show: false });

    // Assert.
    expect(component.find('.container').isEmptyRender()).toBeTruthy();
  });
});
