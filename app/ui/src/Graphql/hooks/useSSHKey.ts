import { RegenerateSSHKey } from './../mutations/types/RegenerateSSHKey';
import { loader } from 'graphql.macro';
import { useMutation } from '@apollo/client';

const RegenerateSSHKeyMutation = loader(
  'Graphql/mutations/regenerateSSHKey.graphql'
);

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
