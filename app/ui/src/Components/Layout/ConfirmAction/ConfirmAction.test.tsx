import { ModalContainer, ModalLayoutJustify } from 'kwc';

import ConfirmAction from './ConfirmAction';
import React from 'react';
import { shallow } from 'enzyme';

const actionMock = jest.fn();

let component;

describe('ConfirmAction component - without input', () => {
  beforeEach(() => {
    component = shallow(
      <ConfirmAction
        title="Some title"
        action={actionMock}
        actionLabel="Action label"
        subtitle="Some subtitle"
        warning={false}
        error={false}
        message="Some message"
        showInput={false}
        confirmationWord={undefined}
      >
        <div id="child-1">Child 1</div>
      </ConfirmAction>
    );
  });

  test('Component match snapshot', () => {
    expect(component).toMatchSnapshot();
  });

  it('show right texts', () => {
    // First, make the modal visible
    component
      .find('div')
      .first()
      .simulate('click', { stopPropagation() {} });

    expect(component.contains('Some message')).toBeTruthy();
  });

  it('handles events', () => {
    // First, make the modal visible
    component
      .find('div')
      .first()
      .simulate('click', { stopPropagation() {} });

    // Then click on Accept button
    component.find(ModalContainer).props().onAccept();

    expect(actionMock).toHaveBeenCalledTimes(1);
  });
});

describe('ConfirmAction component - with input', () => {
  beforeEach(() => {
    component = shallow(
      <ConfirmAction
        title="Some title"
        action={actionMock}
        actionLabel="Action label"
        subtitle="Some subtitle"
        warning={false}
        error={false}
        message="Some message"
        showInput={true}
        confirmationWord={'WORD'}
      >
        <div id="child-1">Child 1</div>
      </ConfirmAction>
    );

    actionMock.mockClear();
  });

  test('Component match snapshot', () => {
    expect(component).toMatchSnapshot();
  });

  it('show right texts', () => {
    // First, make the modal visible
    component
      .find('div')
      .first()
      .simulate('click', { stopPropagation() {} });

    expect(component.contains('Some message')).toBeTruthy();
    expect(component.find(ModalLayoutJustify).props().label).toBe(
      'WRITE "WORD"'
    );
  });
});
