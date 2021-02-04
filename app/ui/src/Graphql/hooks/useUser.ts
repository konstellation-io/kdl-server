import { AddUser, AddUserVariables } from 'Graphql/mutations/types/AddUser';
import { ApolloCache, FetchResult, useMutation } from '@apollo/client';
import { GetUsers, GetUsers_users } from 'Graphql/queries/types/GetUsers';
import {
  RemoveUsers,
  RemoveUsersVariables,
} from './../mutations/types/RemoveUsers';
import {
  UpdateAccessLevel,
  UpdateAccessLevelVariables,
} from './../mutations/types/UpdateAccessLevel';

import { AccessLevel } from 'Graphql/types/globalTypes';
import { loader } from 'graphql.macro';
import { mutationPayloadHelper } from 'Utils/formUtils';

const AddUserMutation = loader('Graphql/mutations/addUser.graphql');
const RemoveUsersMutation = loader('Graphql/mutations/removeUsers.graphql');
const UpdateAccessLevelMutation = loader(
  'Graphql/mutations/updateAccessLevel.graphql'
);
const GetUsersQuery = loader('Graphql/queries/getUsers.graphql');

type NewUserParams = {
  email: string;
  accessLevel: AccessLevel;
  confirmation: boolean;
};

export default function useUser(onCompleteAddUser?: () => void) {
  const [mutationAddUser, { loading, error }] = useMutation<
    AddUser,
    AddUserVariables
  >(AddUserMutation, {
    onCompleted: onCompleteAddUser,
    onError: (e) => console.error(`addUser: ${e}`),
    update: updateCacheAdd,
  });

  const [mutationRemoveUsers] = useMutation<RemoveUsers, RemoveUsersVariables>(
    RemoveUsersMutation,
    {
      onError: (e) => console.error(`removeUsers: ${e}`),
      update: updateCacheRemove,
    }
  );

  const [mutationUpdateAccessLevel] = useMutation<
    UpdateAccessLevel,
    UpdateAccessLevelVariables
  >(UpdateAccessLevelMutation, {
    onError: (e) => console.error(`updateAccessLevel: ${e}`),
  });

  function updateCache(
    cache: ApolloCache<AddUser | RemoveUsers>,
    write: (users: GetUsers_users[]) => void
  ) {
    const cacheResult = cache.readQuery<GetUsers>({
      query: GetUsersQuery,
    });

    if (cacheResult !== null) {
      write(cacheResult.users);
    }
  }

  function updateCacheAdd(
    cache: ApolloCache<AddUser>,
    { data: dataAdd }: FetchResult<AddUser>
  ) {
    if (dataAdd && dataAdd.addUser) {
      updateCache(cache, (users) =>
        cache.writeQuery({
          query: GetUsersQuery,
          data: {
            users: [...users, dataAdd.addUser],
          },
        })
      );
    }
  }

  function updateCacheRemove(
    cache: ApolloCache<RemoveUsers>,
    { data: dataRemove }: FetchResult<RemoveUsers>
  ) {
    if (dataRemove && dataRemove.removeUsers) {
      updateCache(cache, (users) =>
        cache.writeQuery({
          query: GetUsersQuery,
          data: {
            users: users.filter(
              (user) =>
                !dataRemove.removeUsers
                  .map((removedUser) => removedUser.id)
                  .includes(user.id)
            ),
          },
        })
      );
    }
  }

  function addNewUser(newUser: NewUserParams) {
    mutationAddUser(mutationPayloadHelper(newUser));
  }

  function removeUsersById(userIds: string[]) {
    mutationRemoveUsers(mutationPayloadHelper({ userIds }));
  }

  function updateUsersAccessLevel(userIds: string[], accessLevel: AccessLevel) {
    mutationUpdateAccessLevel(mutationPayloadHelper({ userIds, accessLevel }));
  }

  return {
    addNewUser,
    removeUsersById,
    updateUsersAccessLevel,
    add: { loading, error },
  };
}
