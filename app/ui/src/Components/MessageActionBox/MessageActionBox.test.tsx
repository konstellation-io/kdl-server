import { Button, Check } from 'kwc';
import MessageActionBox, { BOX_THEME } from './MessageActionBox';

import React from 'react';
import SomeIcon from '@material-ui/icons/Archive';
import { shallow } from 'enzyme';

const onActionMock = jest.fn();

const component = shallow(
  <MessageActionBox
    title="Some title"
    description="Some description"
    action={{
      needConfirmation: true,
      message: 'Some message',
      label: 'Some label',
      onClick: onActionMock,
      Icon: SomeIcon,
    }}
    theme={BOX_THEME.DEFAULT}
  />
);

describe('MessageActionBox component', () => {
  test('Component match snapshot', () => {
    expect(component).toMatchSnapshot();
  });

  it('show right texts', () => {
    // Arrange.
    // Act.
    // Assert.
    expect(component.contains('Some title')).toBeTruthy();
    expect(component.contains('Some description')).toBeTruthy();
    expect(component.contains('Some message')).toBeTruthy();
  });

  it('checks validation before performing action', () => {
    // Arrange.
    const buttonInitialDisabled = component.find(Button).props().disabled;

    // Act.
    component.find(Check).props().onChange(true);
    component.find(Button).props().onClick();

    // Assert.
    expect(buttonInitialDisabled).toBeTruthy();
    expect(component.find(Button).props().disabled).toBeFalsy();
    expect(onActionMock).toHaveBeenCalledTimes(1);
  });
});
