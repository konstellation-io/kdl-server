import { gql } from '@apollo/client';

export default gql`
  query GetUsers {
    users {
      id
      username
      email
      creationDate
      accessLevel
      lastActivity
    }
  }
`;
