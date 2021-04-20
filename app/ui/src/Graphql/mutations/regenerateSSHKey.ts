import { gql } from '@apollo/client';

export default gql`
  mutation RegenerateSSHKey {
    regenerateSSHKey {
      id
      sshKey {
        public
        private
        creationDate
        lastActivity
      }
    }
  }
`;
