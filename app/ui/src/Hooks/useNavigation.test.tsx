import * as React from 'react';
import { shallow } from 'enzyme';
import useNavigation from './useNavigation';
import { HookWrapper } from '../testUtils';

const beforeGoToStepMock = jest.fn();

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
    />,
  );

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const getHook = () => wrapper.find('div').props().hook;

  it('shows right initial state as expected', () => {
    // Arrange.
    // Act.
    // Assert.
    expect(getHook().actStep).toBe(0);
  });

  it('calls beforeGoToStep properly', () => {
    // Arrange.
    // Act.
    getHook().goToStep(2);
    getHook().prevStep();

    // Assert.
    expect(beforeGoToStepMock).toHaveBeenCalledTimes(2);
  });

  it('moves between steps', () => {
    // Arrange.
    // Act.
    getHook().goToStep(3);
    const goToStepStep = getHook().actStep;
    const goToStepDirection = getHook().direction;

    getHook().prevStep();
    const prevStepStep = getHook().actStep;
    const prevStepDirection = getHook().direction;

    // Assert.
    expect(goToStepStep).toBe(3);
    expect(goToStepDirection).toBe('next');
    expect(prevStepStep).toBe(2);
    expect(prevStepDirection).toBe('prev');
  });

  it('handles loop moves', () => {
    // Arrange.
    // Act.
    getHook().goToStep(3);
    const goToStepStep = getHook().actStep;

    getHook().nextStep();
    const nextStepStep = getHook().actStep;
    const nextStepDirection = getHook().direction;

    getHook().prevStep();
    const prevStepStep = getHook().actStep;
    const prevStepDirection = getHook().direction;

    // Assert.
    expect(goToStepStep).toBe(3);
    expect(nextStepStep).toBe(0);
    expect(nextStepDirection).toBe('prev');
    expect(prevStepStep).toBe(3);
    expect(prevStepDirection).toBe('next');
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
    />,
  );

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
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
