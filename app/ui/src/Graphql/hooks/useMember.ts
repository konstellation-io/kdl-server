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
    }
  );

  const [mutationRemoveMember] = useMutation<
    RemoveMember,
    RemoveMemberVariables
  >(RemoveMemberMutation, {
    onError: (e) => console.error(`removeMember: ${e}`),
  });

  const [mutationUpdateMember] = useMutation<
    UpdateMember,
    UpdateMemberVariables
  >(UpdateMemberMutation, {
    onCompleted: options && options.onCompleteUpdate,
    onError: (e) => console.error(`updateMember: ${e}`),
  });

  function addMembersById(userIds: string[]) {
    mutationAddMembers(
      mutationPayloadHelper({
        projectId,
        userIds,
      })
    );
  }

  function removeMemberById(userId: string) {
    mutationRemoveMember(mutationPayloadHelper({ projectId, userId }));
  }

  function updateMemberAccessLevel(userId: string, accessLevel: AccessLevel) {
    mutationUpdateMember(
      mutationPayloadHelper({ projectId, userId, accessLevel })
    );
  }

  return {
    addMembersById,
    removeMemberById,
    updateMemberAccessLevel,
  };
}
