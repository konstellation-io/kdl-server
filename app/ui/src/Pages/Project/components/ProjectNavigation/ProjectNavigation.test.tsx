import * as React from 'react';
import ProjectNavigation, { NavButtonLink } from './ProjectNavigation';
import { shallow } from 'enzyme';
import { StaticRouter } from 'react-router';
import NavElements from './components/NavElements/NavElements';
import NavigationButton from './components/NavigationButton/NavigationButton';

jest.mock('react-router-dom', () => ({
  useRouteMatch: () => ({
    isExact: false,
  }),
  useParams: () => ({
    projectId: 'projectId',
  }),
}));

describe('ProjectNavigation component', () => {
  const component = shallow(<ProjectNavigation />);

  test('Component match snapshot', () => {
    expect(component).toMatchSnapshot();
  });

  it('should be opened by default', () => {
    expect(component.find(NavElements).props().isOpened).toBeTruthy();
  });

  it('should be closed after clicking on the toggle button', () => {
    // Act.
    const toggleButton = component.find(NavigationButton).last();
    toggleButton.simulate('click');

    // Assert.
    expect(component.find(NavElements).props().isOpened).toBeFalsy();
  });
});

describe('NavButtonLink component', () => {
  const component = shallow(
    <StaticRouter>
      <NavButtonLink to="/home" disabled={false} />
    </StaticRouter>,
  );

  test('Component match snapshot', () => {
    expect(component).toMatchSnapshot();
  });
});
