import { gql } from '@apollo/client';

export default gql`
  query GetMe {
    me {
      id
      email
      areToolsActive
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
