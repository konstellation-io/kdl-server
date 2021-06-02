import React from 'react';
import SettingsMenu from './SettingsMenu';
import { createMockClient } from 'mock-apollo-client';
import { screen, fireEvent, cleanup } from '@testing-library/react';
import GetMeQuery from 'Graphql/queries/getMe';

import data from 'Mocks/GetMeQuery';

import {
  apolloRender,
  dataHandler,
  getSnapshot,
  loadingHandler,
} from 'testUtils';
import ROUTE from 'Constants/routes';

const mockHistoryPush = jest.fn();
jest.mock('react-router-dom', () => ({
  useHistory: () => ({
    push: mockHistoryPush,
  }),
}));

const Component = <SettingsMenu />;

let mockClient;
beforeEach(() => {
  mockClient = createMockClient();
});
afterEach(cleanup);

describe('When component is loading', () => {
  it('should render without crashing', () => {
    // Act.
    mockClient.setRequestHandler(GetMeQuery, loadingHandler);
    apolloRender(Component, mockClient);

    // Assert.
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });
});

describe('When data is ready', () => {
  beforeEach(() => {
    mockClient.setRequestHandler(GetMeQuery, dataHandler(data));
    apolloRender(Component, mockClient);
  });

  it('should render without crashing', () => {
    expect(
      screen.getByText(data.me.email, { exact: false })
    ).toBeInTheDocument();
    expect(getSnapshot()).toMatchSnapshot();
  });

  describe('When opening settings', () => {
    // Opens settings
    beforeEach(() => {
      fireEvent.click(screen.getByText(data.me.email, { exact: false }));
    });

    it('should not perform any action when clicking on the separator', () => {
      // Act.
      fireEvent.click(screen.getByText('USER SETTINGS', { exact: false }));

      // Assert.
      expect(
        screen.getByText('USER SETTINGS', { exact: false })
      ).toBeInTheDocument();
    });

    it('should redirect to ssh key page when clicking on this section', () => {
      // Act.
      fireEvent.click(screen.getByText('SSH KEY', { exact: false }));

      // Assert.
      expect(mockHistoryPush).toHaveBeenCalledTimes(1);
      expect(mockHistoryPush).toHaveBeenCalledWith(ROUTE.USER_SSH_KEY);

      setTimeout(() => {
        expect(
          screen.queryByText('ssh key', { exact: false })
        ).not.toBeInTheDocument();
      }, 0);
    });
  });
});
