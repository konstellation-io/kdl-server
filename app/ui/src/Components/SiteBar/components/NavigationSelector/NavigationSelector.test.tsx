import NavigationSelector from './NavigationSelector';
import * as React from 'react';
import { shallow } from 'enzyme';
import { EnhancedRouteConfiguration } from 'Hooks/useProjectNavigation';
import IconHome from '@material-ui/icons/Dashboard';
import { NavLink } from 'react-router-dom';

const section: EnhancedRouteConfiguration = {
  Icon: IconHome,
  label: 'foo',
  to: 'bar',
};

const props = {
  options: [section],
  closeComponent: jest.fn(),
};

let component;
beforeEach(() => {
  component = shallow(<NavigationSelector {...props} />);
});

describe('SectionSelector component', () => {
  it('should render without crashing', function () {
    expect(component).toMatchSnapshot();
  });

  describe('behavior', () => {
    it('should call closeComponent when click on navLink', function () {
      // Arrange.
      const navLink = component.find(NavLink);

      // Act.
      navLink.simulate('click');

      // Assert.
      expect(props.closeComponent).toHaveBeenCalled();
    });
  });
});
