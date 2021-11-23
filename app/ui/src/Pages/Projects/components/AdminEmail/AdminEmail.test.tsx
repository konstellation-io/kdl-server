import * as React from 'react';
import AdminEmail from './AdminEmail';
import { shallow } from 'enzyme';
import { Button } from 'kwc';

const mockWindowOpen = jest.fn();
window.open = mockWindowOpen;

const component = shallow(<AdminEmail email="email@kosntellation.io" />);

describe('AdminEmail component', () => {
  test('Component match snapshot', () => {
    expect(component).toMatchSnapshot();
  });

  it('should help the user send an email to the user', () => {
    // Arrange.
    const sendEmailButton = component.find(Button).last();

    // Act.
    sendEmailButton.simulate('click');

    // Assert.
    const url = 'mailto:email@kosntellation.io';
    expect(mockWindowOpen).toHaveBeenCalledWith(url);
  });
});
