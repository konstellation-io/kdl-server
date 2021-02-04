import {
  AddApiToken,
  AddApiTokenVariables,
} from './../mutations/types/AddApiToken';
import { ApolloCache, FetchResult, useMutation } from '@apollo/client';
import { GetMe, GetMe_me } from 'Graphql/queries/types/GetMe';

import { RemoveApiToken } from 'Graphql/mutations/types/RemoveApiToken';
import { RemoveApiTokenVariables } from './../mutations/types/RemoveApiToken';
import { loader } from 'graphql.macro';
import { mutationPayloadHelper } from 'Utils/formUtils';

const AddApiTokenMutation = loader('Graphql/mutations/addApiToken.graphql');
const RemoveApiTokenMutation = loader(
  'Graphql/mutations/removeApiToken.graphql'
);
const GetMeQuery = loader('Graphql/queries/getMe.graphql');

export default function useAPIToken() {
  const [mutationAddApiToken, { loading, data }] = useMutation<
    AddApiToken,
    AddApiTokenVariables
  >(AddApiTokenMutation, {
    onError: (e) => console.error(`addMembers: ${e}`),
    update: updateCacheAdd,
  });

  const [mutationRemoveApiToken] = useMutation<
    RemoveApiToken,
    RemoveApiTokenVariables
  >(RemoveApiTokenMutation, {
    onError: (e) => console.error(`removeApiToken: ${e}`),
    update: updateCacheRemove,
  });

  function addTokenByName(userId: string | undefined, name: string) {
    if (userId && name) {
      mutationAddApiToken(mutationPayloadHelper({ userId, name }));
    }
  }

  function removeApiTokenById(apiTokenId: string) {
    if (apiTokenId) {
      mutationRemoveApiToken(mutationPayloadHelper({ apiTokenId }));
    }
  }

  function updateCache(
    cache: ApolloCache<AddApiToken | RemoveApiToken>,
    write: (me: GetMe_me) => void
  ) {
    const cacheResult = cache.readQuery<GetMe>({
      query: GetMeQuery,
    });

    if (cacheResult !== null) {
      write(cacheResult.me);
    }
  }

  function updateCacheAdd(
    cache: ApolloCache<AddApiToken>,
    { data: dataAdd }: FetchResult<AddApiToken>
  ) {
    if (dataAdd && dataAdd.addApiToken) {
      updateCache(cache, (me) =>
        cache.writeQuery({
          query: GetMeQuery,
          data: {
            me: {
              ...me,
              apiTokens: [...me.apiTokens, dataAdd.addApiToken],
            },
          },
        })
      );
    }
  }

  function updateCacheRemove(
    cache: ApolloCache<RemoveApiToken>,
    { data: dataRemove }: FetchResult<RemoveApiToken>
  ) {
    if (dataRemove && dataRemove.removeApiToken) {
      updateCache(cache, (me) =>
        cache.writeQuery({
          query: GetMeQuery,
          data: {
            me: {
              ...me,
              apiTokens: me.apiTokens.filter(
                (t) => t.id !== dataRemove.removeApiToken.id
              ),
            },
          },
        })
      );
    }
  }

  return {
    addTokenByName,
    removeApiTokenById,
    add: { data, loading },
  };
}
