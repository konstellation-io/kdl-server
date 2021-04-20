import { gql } from '@apollo/client';

export default gql`
  query GetSSHKey {
    me {
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
