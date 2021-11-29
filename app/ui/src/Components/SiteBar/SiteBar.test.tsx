import * as React from 'react';
import ArrowsNavigator from './components/ArrowsNavigator/ArrowsNavigator';
import SiteBar from './SiteBar';
import { shallow } from 'enzyme';
import isElectron from 'is-electron';

jest.mock('is-electron', () => jest.fn(() => false));

let component = shallow(<SiteBar />);

describe('SiteBar component', () => {
  test('Component match snapshot', () => {
    expect(component).toMatchSnapshot();
  });

  it('should hide navigation buttons when running on browser', function () {
    expect(component.find(ArrowsNavigator).isEmptyRender()).toBeTruthy();
  });

  it('should show navigation buttons when running on electron', function () {
    // Act.
    isElectron.mockReturnValue(true);
    component = shallow(<SiteBar />);

    // Assert.
    expect(component.find(ArrowsNavigator).isEmptyRender()).toBeFalsy();
  });
});
