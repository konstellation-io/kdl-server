import { RegenerateSSHKey } from './../mutations/types/RegenerateSSHKey';
import { useMutation } from '@apollo/client';

import RegenerateSSHKeyMutation from 'Graphql/mutations/regenerateSSHKey';

type Options = {
  onRegenerateSSHKeyComplete?: () => void;
};

export default function useSSHKey(options?: Options) {
  const [
    mutationRegenerateSSHKey,
    { loading: regenerateSSHKeyLoading },
  ] = useMutation<RegenerateSSHKey>(RegenerateSSHKeyMutation, {
    onCompleted: options?.onRegenerateSSHKeyComplete,
  });

  return {
    regenerateSSHKey: {
      performMutation: mutationRegenerateSSHKey,
      loading: regenerateSSHKeyLoading,
    },
  };
}
