import CheckIcon from '@material-ui/icons/Check';
import CreateIcon from '@material-ui/icons/Create';
import NotInterestedIcon from '@material-ui/icons/NotInterested';
import React from 'react';
import ScheduleIcon from '@material-ui/icons/Schedule';
import Step from './Step';
import Stepper from './Stepper';
import { shallow } from 'enzyme';

const onStepClickMock = jest.fn();

const steps = [
  {
    completed: false,
    error: false,
    label: 'Step 1',
    id: 1,
    active: false,
    visited: false,
    disabled: true,
  },
  {
    completed: false,
    error: false,
    label: 'Step 2',
    id: 2,
    active: true,
    visited: true,
    disabled: false,
  },
];

describe('Stepper component', () => {
  const component = shallow(
    <Stepper steps={steps} activeStep={0} onStepClick={onStepClickMock} />
  );

  test('Component match snapshot', () => {
    expect(component).toMatchSnapshot();
  });

  it('show right elements', () => {
    expect(component.find(Step).length).toBe(2);
  });

  it('does not call onStepClick when step is disabled', () => {
    component.find(Step).first().props().onClick();
    expect(onStepClickMock).toHaveBeenCalledTimes(0);

    component.find(Step).last().props().onClick();
    expect(onStepClickMock).toHaveBeenCalledTimes(1);
  });
});

describe('Step component', () => {
  const component = shallow(<Step {...steps[0]} onClick={onStepClickMock} />);

  test('Component match snapshot', () => {
    expect(component).toMatchSnapshot();
  });

  it('show right icons', () => {
    component.setProps({ completed: true });
    expect(component.find(CheckIcon).isEmptyRender()).toBeFalsy();

    component.setProps({ completed: false, disabled: true });
    expect(component.find(NotInterestedIcon).isEmptyRender()).toBeFalsy();

    component.setProps({ completed: false, disabled: false, active: true });
    expect(component.find(CreateIcon).isEmptyRender()).toBeFalsy();

    component.setProps({ completed: false, disabled: false, active: false });
    expect(component.find(ScheduleIcon).isEmptyRender()).toBeFalsy();
  });
});
