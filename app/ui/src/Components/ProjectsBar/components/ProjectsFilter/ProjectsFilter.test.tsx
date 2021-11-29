import * as React from 'react';
import ProjectsFilter from './ProjectsFilter';
import GetProjectsQuery from 'Graphql/queries/getProjects';
import { createMockClient } from 'mock-apollo-client';
import { screen, fireEvent, cleanup } from '@testing-library/react';
import { apolloRender, loadingHandler, dataHandler, errorHandler, getSnapshot, ERROR_MESSAGE } from 'testUtils';
import data from 'Mocks/GetProjectsQuery';

const Component = <ProjectsFilter />;

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
    expect(screen.getByText('Active', { exact: false })).toBeInTheDocument();
    expect(getSnapshot()).toMatchSnapshot();
  });

  it('should allow the selection of other options', function () {
    // Arrange.
    // Act.
    fireEvent.click(screen.getByText('active', { exact: false }));
    fireEvent.click(screen.getByText('all', { exact: false }));

    // Assert.
    // Waits the action to finish
    setTimeout(() => {
      expect(screen.getByText('all', { exact: false })).toBeInTheDocument();
      expect(screen.queryByText('active', { exact: false })).not.toBeInTheDocument();
    }, 0);
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
