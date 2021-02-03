import Crumb, { CrumbProps } from './Crumb';
import React from 'react';
import { shallow } from 'enzyme';
import IconHome from '@material-ui/icons/Dashboard';
import AnimateHeight from 'react-animate-height';

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
    it('should show the bottom component when click on crumb', () => {
      // Arrange.
      const container = component.find('.crumbContainer');
      const contentProps = component.find(AnimateHeight).props();
      const heightBeforeClick = contentProps.height;

      // Act.
      container.simulate('click');

      // Assert.
      const contentPropsAfter = component.find(AnimateHeight).props();
      const heightAfterClick = contentPropsAfter.height;
      expect(heightBeforeClick).toBe(0);
      expect(heightAfterClick).toBe('auto');
    });

    it('should hide the bottom component when double click on crumb', () => {
      // Arrange.
      const heightBeforeClick = component.find(AnimateHeight).props().height;

      // Act.
      component.find('.container').simulate('click');
      component.find('.container').simulate('click');

      // Assert.
      const heightAfterClick = component.find(AnimateHeight).props().height;
      expect(heightBeforeClick).toBe(0);
      expect(heightAfterClick).toBe(0);
    });
  });
});
