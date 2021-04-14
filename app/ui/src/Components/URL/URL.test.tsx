import URL from './URL';
import React from 'react';
import { shallow } from 'enzyme';

let wrapper;

beforeEach(() => {
  wrapper = shallow(<URL children={'foo'} />);
});
describe('URL component', () => {
  it('should render without crashing', () => {
    // Arrange.
    // Act.
    // Assert.
    expect(wrapper).toMatchSnapshot();
  });

  describe('behavior', () => {
    it('should call open function when clicked', () => {
      // Arrange.
      global.open = jest.fn();
      // Act.
      wrapper.simulate('click');
      // Assert.
      expect(global.open).toHaveBeenCalled();
    });
  });
});
