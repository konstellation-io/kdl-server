import CheckIcon from '@material-ui/icons/Check';
import CreateIcon from '@material-ui/icons/Create';
import NotInterestedIcon from '@material-ui/icons/NotInterested';
import * as React from 'react';
import ScheduleIcon from '@material-ui/icons/Schedule';
import StepNode from './StepNode';
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
  const component = shallow(<Stepper steps={steps} activeStep={0} onStepClick={onStepClickMock} />);

  test('Component match snapshot', () => {
    expect(component).toMatchSnapshot();
  });

  it('show right elements', () => {
    expect(component.find(StepNode).length).toBe(2);
  });

  it('does not call onStepClick when step is disabled', () => {
    component.find(StepNode).first().props().onClick();
    expect(onStepClickMock).toHaveBeenCalledTimes(0);

    component.find(StepNode).last().props().onClick();
    expect(onStepClickMock).toHaveBeenCalledTimes(1);
  });
});

describe('Step component', () => {
  const component = shallow(<StepNode {...steps[0]} onClick={onStepClickMock} />);

  test('Component match snapshot', () => {
    expect(component).toMatchSnapshot();
  });

  it('show right icons', () => {
    // Arrange.
    // Act.
    component.setProps({ completed: true });
    const showsCheck = component.find(CheckIcon).isEmptyRender();

    component.setProps({ completed: false, disabled: true });
    const showsDisabled = component.find(NotInterestedIcon).isEmptyRender();

    component.setProps({ completed: false, disabled: false, active: true });
    const showsActive = component.find(CreateIcon).isEmptyRender();

    component.setProps({ completed: false, disabled: false, active: false });
    const showsPending = component.find(ScheduleIcon).isEmptyRender();

    // Assert.
    expect(showsCheck).toBeFalsy();
    expect(showsDisabled).toBeFalsy();
    expect(showsActive).toBeFalsy();
    expect(showsPending).toBeFalsy();
  });
});
