import { useMutation } from '@apollo/client';
import {
  UpdateAccessLevel,
  UpdateAccessLevelVariables,
} from '../mutations/types/UpdateAccessLevel';

import { AccessLevel } from 'Graphql/types/globalTypes';
import { loader } from 'graphql.macro';
import { mutationPayloadHelper } from 'Utils/formUtils';

const UpdateAccessLevelMutation = loader(
  'Graphql/mutations/updateAccessLevel.graphql'
);

export default function useUser() {
  const [mutationUpdateAccessLevel] = useMutation<
    UpdateAccessLevel,
    UpdateAccessLevelVariables
  >(UpdateAccessLevelMutation, {
    onError: (e) => console.error(`updateAccessLevel: ${e}`),
  });

  function updateUsersAccessLevel(userIds: string[], accessLevel: AccessLevel) {
    mutationUpdateAccessLevel(mutationPayloadHelper({ userIds, accessLevel }));
  }

  return {
    updateUsersAccessLevel,
  };
}
