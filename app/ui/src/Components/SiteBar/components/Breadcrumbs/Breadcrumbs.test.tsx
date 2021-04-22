import Breadcrumbs from './Breadcrumbs';
import React from 'react';
import { shallow } from 'enzyme';

jest.mock('./useBreadcrumbs.tsx', () => () => ({
  crumbs: [
    {
      crumbText: 'foo',
      BottomComponent: <div>bar</div>,
      LeftIconComponent: <svg />,
    },
  ],
}));

describe('Breadcrumbs component', () => {
  it('should render without crashing', () => {
    // Arrange.
    // Act.
    const component = shallow(<Breadcrumbs />);

    // Assert.
    expect(component).toMatchSnapshot();
  });
});
