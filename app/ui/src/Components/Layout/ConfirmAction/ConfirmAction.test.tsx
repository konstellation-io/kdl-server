import { ModalContainer, ModalLayoutJustify } from 'kwc';

import ConfirmAction from './ConfirmAction';
import * as React from 'react';
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
      </ConfirmAction>,
    );
  });

  test('Component match snapshot', () => {
    expect(component).toMatchSnapshot();
  });

  it('show right texts', () => {
    // Arrange.
    // Act.
    component
      .find('div')
      .first()
      .simulate('click', {
        stopPropagation() {
          return;
        },
      });

    // Assert.
    expect(component.contains('Some message')).toBeTruthy();
  });

  it('handles events', () => {
    // Arrange.
    // Act.
    component
      .find('div')
      .first()
      .simulate('click', {
        stopPropagation() {
          return;
        },
      });
    component.find(ModalContainer).props().onAccept();

    // Assert.
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
      </ConfirmAction>,
    );

    actionMock.mockClear();
  });

  test('Component match snapshot', () => {
    expect(component).toMatchSnapshot();
  });

  it('show right texts', () => {
    // Arrange.
    // Act.
    component
      .find('div')
      .first()
      .simulate('click', {
        stopPropagation() {
          return;
        },
      });

    // Assert.
    expect(component.contains('Some message')).toBeTruthy();
    expect(component.find(ModalLayoutJustify).props().label).toBe('WRITE "WORD"');
  });
});
