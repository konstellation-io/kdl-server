import React from 'react';
import { shallow } from 'enzyme';
import useNavigation from './useNavigation';

const beforeGoToStepMock = jest.fn();

const HookWrapper = ({ hook }) => <div hook={hook()} />;

describe('useNavigation hook - loop', () => {
  const wrapper = shallow(
    <HookWrapper
      hook={() =>
        useNavigation({
          initialStep: 0,
          beforeGoToStep: beforeGoToStepMock,
          loop: true,
          maxSteps: 4,
        })
      }
    />
  );

  const getHook = () => wrapper.find('div').props().hook;

  it('shows right initial state', () => {
    expect(getHook().actStep).toBe(0);
  });

  it('calls beforeGoToStep properly', () => {
    getHook().goToStep(2);
    getHook().prevStep();

    expect(beforeGoToStepMock).toHaveBeenCalledTimes(2);
  });

  it('moves between steps', () => {
    getHook().goToStep(3);

    expect(getHook().actStep).toBe(3);
    expect(getHook().direction).toBe('next');

    getHook().prevStep();
    expect(getHook().actStep).toBe(2);
    expect(getHook().direction).toBe('prev');
  });

  it('handles loop moves', () => {
    getHook().goToStep(3);

    expect(getHook().actStep).toBe(3);

    getHook().nextStep();
    expect(getHook().actStep).toBe(0);
    expect(getHook().direction).toBe('prev');

    getHook().prevStep();
    expect(getHook().actStep).toBe(3);
    expect(getHook().direction).toBe('next');
  });
});

describe('useNavigation hook - no loop', () => {
  const wrapper = shallow(
    <HookWrapper
      hook={() =>
        useNavigation({
          initialStep: 3,
          beforeGoToStep: beforeGoToStepMock,
          loop: false,
          maxSteps: 4,
        })
      }
    />
  );

  const getHook = () => wrapper.find('div').props().hook;

  it('shows right initial state', () => {
    expect(getHook().actStep).toBe(3);
  });

  it('does not makes loop moves', () => {
    getHook().nextStep();
    expect(getHook().actStep).toBe(3);

    getHook().goToStep(0);
    getHook().prevStep();
    expect(getHook().actStep).toBe(0);
  });
});
