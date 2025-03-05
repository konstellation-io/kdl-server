import { gql } from '@apollo/client';

export default gql`
  query GetMe {
    me {
      id
      email
      isKubeconfigEnabled
      userTools{
        currentStorageSize
      }
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
