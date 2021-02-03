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
    expect(component.find('.success').isEmptyRender()).toBeFalsy();
    expect(component.find('.error').isEmptyRender()).toBeTruthy();

    component.setProps({ type: CircledInfoMessageTypes.ERROR });

    expect(component.find('.success').isEmptyRender()).toBeTruthy();
    expect(component.find('.error').isEmptyRender()).toBeFalsy();
  });
});
