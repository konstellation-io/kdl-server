import CircledInfoMessage, {
  CircledInfoMessageTypes,
} from './CircledInfoMessage';

import React from 'react';
import { shallow } from 'enzyme';

const component = shallow(
  <CircledInfoMessage type={CircledInfoMessageTypes.SUCCESS} text="some text">
    <div id="children">Children</div>
  </CircledInfoMessage>
);

describe('CircledInfoMessage component', () => {
  test('Component match snapshot', () => {
    expect(component).toMatchSnapshot();
  });

  it('show right texts', () => {
    expect(component.contains('some text')).toBeTruthy();
    expect(component.contains('Children')).toBeTruthy();
  });

  it('contains right classes', () => {
    // Arrange.
    // Act.
    const defaultStateIsSuccess = component.find('.success').isEmptyRender();
    const defaultStateIsError = component.find('.error').isEmptyRender();

    component.setProps({ type: CircledInfoMessageTypes.ERROR });
    const onErrorStateIsSuccess = component.find('.success').isEmptyRender();
    const onErrorStateIsError = component.find('.error').isEmptyRender();

    // Assert.
    expect(defaultStateIsSuccess).toBeFalsy();
    expect(defaultStateIsError).toBeTruthy();
    expect(onErrorStateIsSuccess).toBeTruthy();
    expect(onErrorStateIsError).toBeFalsy();
  });
});
