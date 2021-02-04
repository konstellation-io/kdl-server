import React from 'react';
import { shallow } from 'enzyme';
import useStepper from './useStepper';

const Component1 = () => <div />;
const Component2 = () => <div />;

const data = [
  {
    id: 'step1',
    Component: Component1,
  },
  {
    id: 'step2',
    Component: Component2,
  },
];

const HookWrapper = ({ hook }) => <div hook={hook()} />;
const wrapper = shallow(<HookWrapper hook={() => useStepper({ data })} />);

const getHook = () => wrapper.find('div').props().hook;

const { actStep, nextStep, getActStepComponent, steps } = getHook();

describe('useBoolState hook', () => {
  it('shows right initial state', () => {
    expect(actStep).toBe(0);
    expect(getActStepComponent()).toStrictEqual(
      <Component1 showErrors={false} />
    );
    expect(steps[0]).toStrictEqual({
      id: 'step1',
      completed: false,
      error: false,
    });
  });

  it('handles step change', () => {
    nextStep();

    expect(getHook().actStep).toBe(1);
    expect(getHook().getActStepComponent()).toStrictEqual(
      <Component2 showErrors={false} />
    );
  });

  it('handles state updates', () => {
    getHook().updateState(true, true, 0);
    getHook().updateState(true, false, 1);

    expect(getHook().steps).toStrictEqual([
      {
        id: 'step1',
        completed: true,
        error: true,
      },
      {
        id: 'step2',
        completed: true,
        error: false,
      },
    ]);
  });
});
