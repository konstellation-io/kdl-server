import ProjectSelector from './ProjectSelector';
import React from 'react';
import { shallow } from 'enzyme';
import { GetProjects_projects } from 'Graphql/queries/types/GetProjects';
import { ProjectState } from '../../../../../../../../Graphql/types/globalTypes';
import { NavLink } from 'react-router-dom';

const project: GetProjects_projects = {
  id: 'foo',
  name: 'bar',
  __typename: 'baz',
  creationDate: 'foofoo',
  description: 'foobar',
  error: 'foobaz',
  favorite: true,
  lastActivationDate: 'barfoo',
  repository: null,
  state: ProjectState.STARTED,
};
const projects: GetProjects_projects[] = [project];

const props = {
  options: projects,
  serverId: 'bar',
  closeComponent: jest.fn(),
};

let component;
beforeEach(() => {
  component = shallow(<ProjectSelector {...props} />);
});

describe('ProjectSelector component', () => {
  it('should render without crashing', function () {
    expect(component).toMatchSnapshot();
  });
});

describe('behavior', () => {
  it('should call closeComponent function when click on a link', () => {
    // Arrange.
    const navLink = component.find(NavLink);

    // Act.
    navLink.simulate('click');

    // Assert.
    expect(props.closeComponent).toHaveBeenCalled();
  });
});
