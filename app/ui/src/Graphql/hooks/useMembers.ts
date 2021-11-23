import { AddMembers, AddMembersVariables } from '../mutations/types/AddMembers';
import { useMutation } from '@apollo/client';
import { RemoveMembers, RemoveMembersVariables } from 'Graphql/mutations/types/RemoveMembers';
import { UpdateMembers, UpdateMembersVariables } from 'Graphql/mutations/types/UpdateMembers';

import { AccessLevel } from 'Graphql/types/globalTypes';
import { mutationPayloadHelper } from 'Utils/formUtils';

import UpdateMembersMutation from 'Graphql/mutations/updateMembers';
import RemoveMembersMutation from 'Graphql/mutations/removeMembers';
import AddMembersMutation from 'Graphql/mutations/addMembers';

type Options = {
  onCompleteAdd?: () => void;
  onCompleteUpdate?: () => void;
  onCompleteRemove?: () => void;
};

export default function useMembers(projectId: string, options?: Options) {
  const [mutationAddMembers] = useMutation<AddMembers, AddMembersVariables>(AddMembersMutation, {
    onCompleted: options && options.onCompleteAdd,
    onError: (e) => console.error(`addMembers: ${e}`),
  });

  const [mutationRemoveMembers] = useMutation<RemoveMembers, RemoveMembersVariables>(RemoveMembersMutation, {
    onCompleted: options && options.onCompleteRemove,
    onError: (e) => console.error(`removeMember: ${e}`),
  });

  const [mutationUpdateMembers] = useMutation<UpdateMembers, UpdateMembersVariables>(UpdateMembersMutation, {
    onCompleted: options && options.onCompleteUpdate,
    onError: (e) => console.error(`updateMember: ${e}`),
  });

  function addMembersById(userIds: string[]) {
    mutationAddMembers(
      mutationPayloadHelper({
        projectId,
        userIds,
      }),
    );
  }

  function removeMembersById(userIds: string[]) {
    mutationRemoveMembers(mutationPayloadHelper({ projectId, userIds }));
  }

  function updateMembersAccessLevel(userIds: string[], accessLevel: AccessLevel) {
    mutationUpdateMembers(mutationPayloadHelper({ projectId, userIds, accessLevel }));
  }

  return {
    addMembersById,
    removeMembersById,
    updateMembersAccessLevel,
  };
}
