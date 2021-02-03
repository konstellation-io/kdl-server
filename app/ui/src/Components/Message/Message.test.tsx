import Message from './Message';
import React from 'react';
import { shallow } from 'enzyme';

const component = shallow(<Message text="Some text" />);

describe('Message component', () => {
  test('Component match snapshot', () => {
    expect(component).toMatchSnapshot();
  });

  it('show right texts', () => {
    expect(component.contains('Some text')).toBeTruthy();
  });
});
