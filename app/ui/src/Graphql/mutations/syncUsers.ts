import { gql } from '@apollo/client';

export default gql`
  mutation SyncUsers {
    syncUsers {
      msg
    }
  }
`;
