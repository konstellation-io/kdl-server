import { gql } from '@apollo/client';

export default gql`
  fragment MemberFields on Member {
    user {
      id
      email
      lastActivity
    }
    accessLevel
    addedDate
  }
`;
