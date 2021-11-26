import { useMutation } from '@apollo/client';
import { UpdateAccessLevel, UpdateAccessLevelVariables } from 'Graphql/mutations/types/UpdateAccessLevel';

import { AccessLevel } from 'Graphql/types/globalTypes';
import { mutationPayloadHelper } from 'Utils/formUtils';

import UpdateAccessLevelMutation from 'Graphql/mutations/updateAccessLevel';

export default function useUser() {
  const [mutationUpdateAccessLevel] = useMutation<UpdateAccessLevel, UpdateAccessLevelVariables>(
    UpdateAccessLevelMutation,
    {
      onError: (e) => console.error(`updateAccessLevel: ${e}`),
    },
  );

  function updateUsersAccessLevel(userIds: string[], accessLevel: AccessLevel) {
    mutationUpdateAccessLevel(mutationPayloadHelper({ userIds, accessLevel }));
  }

  return {
    updateUsersAccessLevel,
  };
}
