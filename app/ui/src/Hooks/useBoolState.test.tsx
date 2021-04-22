import React from 'react';
import { shallow } from 'enzyme';
import useBoolState from './useBoolState';

const HookWrapper = ({ hook }) => <div hook={hook()} />;
const wrapper = shallow(<HookWrapper hook={() => useBoolState(false)} />);

const getHook = () => wrapper.find('div').props().hook;
const getValue = () => getHook().value;

const { value, setValue, toggle, activate, deactivate } = getHook();

describe('useBoolState hook', () => {
  it('shows right initial state', () => {
    // Arrange.
    // Act.
    // Assert.
    expect(value).toBeFalsy();
  });

  it('handles state changes', () => {
    // Arrange.
    // Act.
    activate();
    const defaultValue = getValue();

    deactivate();
    const deactivatedValue = getValue();

    toggle();
    const toggledValue = getValue();

    setValue(false);
    const afterSetValue = getValue();

    // Assert.
    expect(defaultValue).toBeTruthy();
    expect(deactivatedValue).toBeFalsy();
    expect(toggledValue).toBeTruthy();
    expect(afterSetValue).toBeFalsy();
  });
});
