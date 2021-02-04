import Panel, { PANEL_SIZE } from './Panel';

import { Button } from 'kwc';
import React from 'react';
import { shallow } from 'enzyme';

const onCloseMock = jest.fn();

const component = shallow(
  <Panel
    title="Some title"
    show={true}
    close={onCloseMock}
    size={PANEL_SIZE.DEFAULT}
    noShrink={true}
    dark={false}
  >
    <div>Children</div>
  </Panel>
);

describe('Panel component', () => {
  test('Component match snapshot', () => {
    expect(component).toMatchSnapshot();
  });

  it('show right texts', () => {
    expect(component.contains('Some title')).toBeTruthy();
  });

  it('handles events', () => {
    component.find(Button).simulate('click');

    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it('hides content when closed', () => {
    component.setProps({ show: false });

    expect(component.find('.container').isEmptyRender()).toBeTruthy();
  });
});
