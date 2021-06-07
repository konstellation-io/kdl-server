import Breadcrumbs from './Breadcrumbs';
import React from 'react';
import { shallow } from 'enzyme';

jest.mock('react-router-dom', () => ({
  useRouteMatch: () => true,
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
