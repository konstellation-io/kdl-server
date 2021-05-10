import React from 'react';
import Projects from './Projects';
import GetProjectsQuery from 'Graphql/queries/getProjects';
import { createMockClient } from 'mock-apollo-client';
import { screen, fireEvent, cleanup, within } from '@testing-library/react';
import {
  apolloRender,
  loadingHandler,
  dataHandler,
  errorHandler,
  getSnapshot,
  ERROR_MESSAGE,
} from 'testUtils';
import data from 'Mocks/GetProjectsQuery';
import { StaticRouter } from 'react-router';

const Component = (
  <StaticRouter>
    <Projects />
  </StaticRouter>
);

let mockClient;
beforeEach(() => {
  mockClient = createMockClient();
});
afterEach(cleanup);

describe('When component is loading', () => {
  beforeEach(() => {
    mockClient.setRequestHandler(GetProjectsQuery, loadingHandler);
    apolloRender(Component, mockClient);
  });

  it('should render without crashing', () => {
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });
});

describe('When data is ready', () => {
  beforeEach(() => {
    mockClient.setRequestHandler(GetProjectsQuery, dataHandler(data));
    apolloRender(Component, mockClient);
  });

  it('should render without crashing', () => {
    expect(getSnapshot()).toMatchSnapshot();
  });

  it('should show two projects and one add project', function () {
    // Arrange.
    const projects = screen.getAllByTestId('project');
    const newProject = screen.getByTestId('add-project');

    // Assert.
    expect(projects.length).toBe(2);
    expect(newProject).toBeInTheDocument();
  });

  test('when filtering by ARCHIVED, it should only show one project', () => {
    // Act.
    // Opens filter
    const projectsFilter = screen.getByText('active', { exact: false });
    fireEvent.click(projectsFilter);

    // Select Archived projects
    const archivedOption = screen.getByText('archived', { exact: false });
    fireEvent.click(archivedOption);

    // Assert.
    const projects = screen.getAllByTestId('project');
    const archivedProject = within(projects[0]).getByText('Archived');
    expect(projects.length).toBe(1);
    expect(archivedProject).toBeInTheDocument();
  });

  test('when filtering by INACCESSIBLE, it should only show one project', () => {
    // Act.
    // Opens filter
    const projectsFilter = screen.getByText('active', { exact: false });
    fireEvent.click(projectsFilter);

    // Select Inaccessible projects
    const inaccessibleOption = screen.getByText('inaccessible', {
      exact: false,
    });
    fireEvent.click(inaccessibleOption);

    // Assert.
    const projects = screen.getAllByTestId('project');
    const inaccessibleProject = within(projects[0]).getByText('No Access');
    expect(projects.length).toBe(1);
    expect(inaccessibleProject).toBeInTheDocument();
  });

  test('when filtering by All, it should four projects', () => {
    // Act.
    // Opens filter
    const projectsFilter = screen.getByText('active', { exact: false });
    fireEvent.click(projectsFilter);

    // Select All projects
    const allOption = screen.getByText('all', { exact: false });
    fireEvent.click(allOption);

    // Assert.
    const projects = screen.getAllByTestId('project');
    expect(projects.length).toBe(4);
  });
});

describe('When there is an error', () => {
  beforeEach(() => {
    mockClient.setRequestHandler(GetProjectsQuery, errorHandler(''));
    apolloRender(Component, mockClient);
  });

  it('should render without crashing', () => {
    expect(screen.getByText(ERROR_MESSAGE)).toBeInTheDocument();
  });
});

// Arrange.
// Act.
// Assert.
