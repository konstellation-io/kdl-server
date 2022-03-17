import { gql } from '@apollo/client';

export default gql`
  query GetMe {
    me {
      id
      email
      isKubeconfigEnabled
      accessLevel
      apiTokens {
        id
        name
        creationDate
        lastUsedDate
      }
    }
  }
`;
