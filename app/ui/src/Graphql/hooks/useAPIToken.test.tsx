import useAPIToken from './useAPIToken';
import GetMeQuery from 'Graphql/queries/getMe';
import AddApiTokenMutation from 'Graphql/mutations/addApiToken';
import RemoveApiTokenMutation from 'Graphql/mutations/removeApiToken';
import { createMockClient } from 'mock-apollo-client';
import { dataHandler, apolloHookRender } from 'testUtils';
import dataMe from 'Mocks/GetMeQuery';
import dataAddApiToken from 'Mocks/AddAPITokenMutation';
import dataRemoveApiToken from 'Mocks/RemoveAPITokenMutation';
import { act } from 'react-dom/test-utils';

const addAPITokenHandler = jest.fn();
const removeAPITokenHandler = jest.fn();

let mockClient;
beforeEach(() => {
  mockClient = createMockClient();
});

describe('useApiToken', () => {
  let hook;

  beforeEach(async () => {
    addAPITokenHandler.mockResolvedValue(dataAddApiToken);
    removeAPITokenHandler.mockResolvedValue(dataRemoveApiToken);

    mockClient.setRequestHandler(GetMeQuery, dataHandler(dataMe));
    mockClient.setRequestHandler(AddApiTokenMutation, addAPITokenHandler);
    mockClient.setRequestHandler(RemoveApiTokenMutation, removeAPITokenHandler);

    hook = await apolloHookRender(() => useAPIToken(), mockClient);
  });

  afterEach(() => {
    addAPITokenHandler.mockClear();
    removeAPITokenHandler.mockClear();
  });

  describe('addTokenByName', () => {
    it('should call add API token mutation', () => {
      act(() => {
        hook.addTokenByName('userId', 'tokenName');
      });

      expect(addAPITokenHandler).toHaveBeenCalledTimes(1);
    });
  });

  describe('removeApiTokenById', () => {
    it('should call remove API token mutation', () => {
      act(() => {
        hook.removeApiTokenById('userId');
      });

      expect(removeAPITokenHandler).toHaveBeenCalledTimes(1);
    });
  });
});
