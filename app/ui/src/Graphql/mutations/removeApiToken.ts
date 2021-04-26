import { gql } from '@apollo/client';

export default gql`
  mutation RemoveApiToken($input: RemoveApiTokenInput!) {
    removeApiToken(input: $input) {
      id
    }
  }
`;
