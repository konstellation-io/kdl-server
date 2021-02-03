import { RegenerateSSHKey } from './../mutations/types/RegenerateSSHKey';
import { loader } from 'graphql.macro';
import { useMutation } from '@apollo/client';

const RegenerateSSHKeyMutation = loader(
  'Graphql/mutations/regenerateSSHKey.graphql'
);

export default function useSSHKey() {
  const [mutationRegenerateSSHKey] = useMutation<RegenerateSSHKey>(
    RegenerateSSHKeyMutation
  );

  return {
    regenerateSSHKey: mutationRegenerateSSHKey,
  };
}
