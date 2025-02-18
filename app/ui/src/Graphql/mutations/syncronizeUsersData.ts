import { gql } from '@apollo/client';

export default gql`
  mutation SynchronizeUsersData($input: SyncUsersDataInput!) {
    synchronizeUsersData(input: $input)
  }
`;
