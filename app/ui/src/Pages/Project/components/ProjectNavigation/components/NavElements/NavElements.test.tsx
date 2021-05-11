import React from 'react';
import NavElements from './NavElements';
import GetMeQuery from 'Graphql/queries/getMe';
import SetActiveUserToolsMutation from 'Graphql/mutations/setActiveUserTools';
import { createMockClient } from 'mock-apollo-client';
import { screen, fireEvent, cleanup, within } from '@testing-library/react';
import {
  apolloRender,
  loadingHandler,
  dataHandler,
  getSnapshot,
} from 'testUtils';
import data from 'Mocks/GetMeQuery';
import mutationData from 'Mocks/SetActiveProjectToolsMutation';
import { StaticRouter } from 'react-router';

const Component = (
  <StaticRouter>
    <NavElements isOpened />
  </StaticRouter>
);
let mockClient;
beforeEach(() => {
  mockClient = createMockClient();
});
afterEach(cleanup);

describe('When component is loading', () => {
  beforeEach(() => {
    mockClient.setRequestHandler(GetMeQuery, loadingHandler);
    apolloRender(Component, mockClient);
  });

  it('should render without crashing', () => {
    expect(screen.queryByText('tools')).not.toBeInTheDocument();
  });
});

describe('When data is ready', () => {
  beforeEach(() => {
    mockClient.setRequestHandler(GetMeQuery, dataHandler(data));
    apolloRender(Component, mockClient);
  });

  it('should render without crashing', () => {
    expect(getSnapshot()).toMatchSnapshot();
  });

  it('should show confirmation modal when stopping user tools', () => {
    // Act.
    const stopToolButton = screen.getByText('stop tools', { exact: false });
    fireEvent.click(stopToolButton);

    // Assert.
    const modal = screen.getByText('STOP YOUR TOOLS', { exact: false });
    expect(modal).toBeInTheDocument();
  });
});

describe('When stopping tools', () => {
  let mockMutation = jest.fn();

  beforeEach(() => {
    mockMutation.mockResolvedValue({ data: mutationData });

    mockClient.setRequestHandler(GetMeQuery, dataHandler(data));
    mockClient.setRequestHandler(SetActiveUserToolsMutation, mockMutation);
    apolloRender(Component, mockClient);
  });

  afterEach(() => {
    mockMutation.mockClear();
  });

  it('should call mutation function', () => {
    // Act.
    const stopToolButton = screen.getByText('stop tools', { exact: false });
    fireEvent.click(stopToolButton);

    const modal = screen.getByTestId('confirmationModal');
    const acceptButton = within(modal).getByText('Stop tools', {
      exact: false,
    });
    fireEvent.click(acceptButton);

    // Assert.
    setTimeout(() => {
      expect(mockMutation).toHaveBeenCalled();
    }, 0);
  });

  it('should not call mutation function when cancelling the operation', () => {
    // Act.
    const stopToolButton = screen.getByText('stop tools', { exact: false });
    fireEvent.click(stopToolButton);

    const modal = screen.getByTestId('confirmationModal');
    const cancelButton = within(modal).getByText('Cancel', {
      exact: false,
    });
    fireEvent.click(cancelButton);

    // Assert.
    setTimeout(() => {
      expect(mockMutation).not.toHaveBeenCalled();
    }, 0);
  });
});
