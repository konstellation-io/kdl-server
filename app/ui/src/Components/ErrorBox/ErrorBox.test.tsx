import AnimateHeight from 'react-animate-height';
import ErrorBox from './ErrorBox';
import React from 'react';
import { shallow } from 'enzyme';

const onChangeMock = jest.fn();
const onActionClickMock = jest.fn();

let component;

beforeEach(() => {
  component = shallow(
    <ErrorBox
      title="Some title"
      message="Some message"
      docUrl="Some URL"
      openController={false}
      onChange={onChangeMock}
      action={{
        label: 'Some action',
        onClick: onActionClickMock,
      }}
    />
  );

  onChangeMock.mockClear();
});

describe('ErrorBox component', () => {
  test('Component match snapshot', () => {
    expect(component).toMatchSnapshot();
  });

  it('show right texts', () => {
    expect(component.contains('Some title')).toBeTruthy();
    expect(component.contains('Some message')).toBeTruthy();
  });

  it('handles open/close events', () => {
    // Initially component is closed
    expect(component.find(AnimateHeight).props().height).not.toBe('auto');

    component.find('.titleRow').simulate('click');

    expect(onChangeMock).toHaveBeenCalledTimes(1);
  });

  it('handles open/close events with state', () => {
    component.setProps({ onChange: undefined });

    // Initially component is closed
    expect(component.find(AnimateHeight).props().height).not.toBe('auto');

    component.find('.titleRow').simulate('click');

    // Use inner setState when onChange is not used
    expect(onChangeMock).toHaveBeenCalledTimes(0);
    expect(component.find('.opened').isEmptyRender()).toBeFalsy();
  });

  it('allows actions', () => {
    component.find('.buttons').children().first().simulate('click');

    expect(onActionClickMock).toHaveBeenCalledTimes(1);
  });
});
