import Crumb, { CrumbProps } from './Crumb';
import React from 'react';
import { shallow } from 'enzyme';
import IconHome from '@material-ui/icons/Dashboard';
import ExpandableMenu from 'Components/ExpandableMenu/ExpandableMenu';

const BottomComponent = () => <div>bar</div>;
const crumbProps: CrumbProps = {
  crumbText: 'foo',
  BottomComponent,
  LeftIconComponent: <IconHome />,
};

let component;
beforeEach(() => {
  component = shallow(<Crumb {...crumbProps} />);
});

describe('Crumb component', () => {
  it('should render without crashing', () => {
    expect(component).toMatchSnapshot();
  });

  describe('behavior', () => {
    it('should open the menu on click', () => {
      // Arrange.
      const container = component.find('.container');
      const wasComponentOpened = component.find(ExpandableMenu).props().opened;
      // Act.

      container.simulate('click');
      const isComponentOpened = component.find(ExpandableMenu).props().opened;

      // Assert.
      expect(wasComponentOpened).toBeFalsy();
      expect(isComponentOpened).toBeTruthy();
    });
  });
});
