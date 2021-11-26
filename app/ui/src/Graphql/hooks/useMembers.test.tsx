import useMembers from './useMembers';
import AddMembersMutation from 'Graphql/mutations/addMembers';
import RemoveMembersMutation from 'Graphql/mutations/removeMembers';
import UpdateMembersMutation from 'Graphql/mutations/updateMembers';
import { createMockClient } from 'mock-apollo-client';
import { apolloHookRender } from 'testUtils';
import dataAddMembers from 'Mocks/AddMembersMutation';
import dataRemoveMembers from 'Mocks/RemoveMembersMutation';
import dataUpdateMembers from 'Mocks/UpdateMembersMutation';
import { act } from 'react-dom/test-utils';

const addMembersHandler = jest.fn();
const removeMembersHandler = jest.fn();
const updateMembersHandler = jest.fn();

let mockClient;
beforeEach(() => {
  mockClient = createMockClient();
});

describe('useApiToken', () => {
  let hook;

  beforeEach(async () => {
    addMembersHandler.mockResolvedValue(dataAddMembers);
    removeMembersHandler.mockResolvedValue(dataRemoveMembers);
    updateMembersHandler.mockResolvedValue(dataUpdateMembers);

    mockClient.setRequestHandler(AddMembersMutation, addMembersHandler);
    mockClient.setRequestHandler(RemoveMembersMutation, removeMembersHandler);
    mockClient.setRequestHandler(UpdateMembersMutation, updateMembersHandler);

    hook = await apolloHookRender(() => useMembers('projectId'), mockClient);
  });

  afterEach(() => {
    addMembersHandler.mockClear();
    removeMembersHandler.mockClear();
    updateMembersHandler.mockClear();
  });

  describe('addMembersById', () => {
    it('should call add members mutation', () => {
      act(() => {
        hook.addMembersById('memberId1', 'memberId2');
      });

      expect(addMembersHandler).toHaveBeenCalledTimes(1);
    });
  });

  describe('removeApiTokenById', () => {
    it('should call remove member mutation', () => {
      act(() => {
        hook.removeMembersById('userId');
      });

      expect(removeMembersHandler).toHaveBeenCalledTimes(1);
    });
  });
});
