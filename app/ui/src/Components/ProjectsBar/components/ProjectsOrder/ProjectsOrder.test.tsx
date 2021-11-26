import * as React from 'react';
import ProjectsOrder from './ProjectsOrder';
import { createMockClient } from 'mock-apollo-client';
import { screen, fireEvent, cleanup } from '@testing-library/react';
import GetProjectsQuery from 'Graphql/queries/getProjects';

import data from 'Mocks/GetProjectsQuery';

import { apolloRender, loadingHandler, dataHandler, errorHandler, getSnapshot, ERROR_MESSAGE } from 'testUtils';

const Component = <ProjectsOrder />;

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
    expect(screen.getByText('Creation date')).toBeInTheDocument();
    expect(getSnapshot()).toMatchSnapshot();
  });

  it('should allow the selection of other options', function () {
    // Act.
    fireEvent.click(screen.getByText('Creation date', { exact: false }));
    fireEvent.click(screen.getByText('From A to Z', { exact: false }));

    // Assert.
    // Waits the action to finish
    setTimeout(() => {
      expect(screen.getByText('From A to Z', { exact: false })).toBeInTheDocument();
      expect(screen.queryByText('Creation date', { exact: false })).not.toBeInTheDocument();
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
