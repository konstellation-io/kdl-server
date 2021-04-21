import { gql } from '@apollo/client';
import MemberFields from '../fragments/memberFragment';

export default gql`
  ${MemberFields}
  mutation RemoveMembers($input: RemoveMembersInput!) {
    removeMembers(input: $input) {
      id
      members {
        ...MemberFields
      }
    }
  }
`;
