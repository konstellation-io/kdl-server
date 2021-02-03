import {
  AddMembers,
  AddMembersVariables,
} from './../mutations/types/AddMembers';
import { ApolloCache, FetchResult, useMutation } from '@apollo/client';
import {
  GetProjectMembers,
  GetProjectMembers_project,
} from 'Graphql/queries/types/GetProjectMembers';
import {
  RemoveMember,
  RemoveMemberVariables,
} from 'Graphql/mutations/types/RemoveMember';
import {
  UpdateMember,
  UpdateMemberVariables,
} from 'Graphql/mutations/types/UpdateMember';

import { AccessLevel } from 'Graphql/types/globalTypes';
import { loader } from 'graphql.macro';
import { mutationPayloadHelper } from 'Utils/formUtils';

const GetMembersQuery = loader('Graphql/queries/getProjectMembers.graphql');
const UpdateMemberMutation = loader('Graphql/mutations/updateMember.graphql');
const RemoveMemberMutation = loader('Graphql/mutations/removeMember.graphql');
const AddMembersMutation = loader('Graphql/mutations/addMembers.graphql');

type Options = {
  onCompleteAdd?: () => void;
  onCompleteUpdate?: () => void;
};

export default function useMember(projectId: string, options?: Options) {
  const [mutationAddMembers] = useMutation<AddMembers, AddMembersVariables>(
    AddMembersMutation,
    {
      onCompleted: options && options.onCompleteAdd,
      onError: (e) => console.error(`addMembers: ${e}`),
      update: updateCacheAdd,
    }
  );

  const [mutationRemoveMember] = useMutation<
    RemoveMember,
    RemoveMemberVariables
  >(RemoveMemberMutation, {
    onError: (e) => console.error(`removeMember: ${e}`),
    update: updateCacheRemove,
  });

  const [mutationUpdateMember] = useMutation<
    UpdateMember,
    UpdateMemberVariables
  >(UpdateMemberMutation, {
    onCompleted: options && options.onCompleteUpdate,
    onError: (e) => console.error(`updateMember: ${e}`),
  });

  function updateCache(
    cache: ApolloCache<RemoveMember | AddMembers>,
    write: (project: GetProjectMembers_project) => void
  ) {
    const cacheResult = cache.readQuery<GetProjectMembers>({
      variables: {
        id: projectId,
      },
      query: GetMembersQuery,
    });

    if (cacheResult !== null) {
      write(cacheResult.project);
    }
  }

  function updateCacheAdd(
    cache: ApolloCache<AddMembers>,
    { data: dataAdd }: FetchResult<AddMembers>
  ) {
    if (dataAdd && dataAdd.addMembers) {
      updateCache(cache, (project) =>
        cache.writeQuery({
          query: GetMembersQuery,
          variables: {
            id: projectId,
          },
          data: {
            project: {
              ...project,
              members: [...project.members, ...dataAdd.addMembers],
            },
          },
        })
      );
    }
  }

  function updateCacheRemove(
    cache: ApolloCache<RemoveMember>,
    { data: dataRemove }: FetchResult<RemoveMember>
  ) {
    if (dataRemove && dataRemove.removeMember) {
      updateCache(cache, (project) =>
        cache.writeQuery({
          query: GetMembersQuery,
          variables: {
            id: projectId,
          },
          data: {
            project: {
              ...project,
              members: project.members.filter(
                (m) => m.id !== dataRemove.removeMember.id
              ),
            },
          },
        })
      );
    }
  }

  function addMembersById(memberIds: string[]) {
    mutationAddMembers(
      mutationPayloadHelper({
        projectId,
        memberIds,
      })
    );
  }

  function removeMemberById(memberId: string) {
    mutationRemoveMember(mutationPayloadHelper({ projectId, memberId }));
  }

  function updateMemberAccessLevel(memberId: string, accessLevel: AccessLevel) {
    mutationUpdateMember(
      mutationPayloadHelper({ projectId, memberId, accessLevel })
    );
  }

  return {
    addMembersById,
    removeMemberById,
    updateMemberAccessLevel,
  };
}
