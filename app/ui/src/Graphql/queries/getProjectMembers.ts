import { gql } from '@apollo/client';
import MemberFields from '../fragments/memberFragment';

export default gql`
  ${MemberFields}
  query GetProjectMembers($id: ID!) {
    project(id: $id) {
      id
      members {
        ...MemberFields
      }
    }
  }
`;
