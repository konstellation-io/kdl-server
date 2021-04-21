import { gql } from '@apollo/client';

export default gql`
  mutation AddApiToken($input: ApiTokenInput!) {
    addApiToken(input: $input) {
      id
      name
      creationDate
      lastUsedDate
      token
    }
  }
`;
