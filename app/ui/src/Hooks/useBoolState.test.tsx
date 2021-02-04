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
    expect(value).toBeFalsy();
  });

  it('handles state changes', () => {
    activate();
    expect(getValue()).toBeTruthy();

    deactivate();
    expect(getValue()).toBeFalsy();

    toggle();
    expect(getValue()).toBeTruthy();

    setValue(false);
    expect(getValue()).toBeFalsy();
  });
});
