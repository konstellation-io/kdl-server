import { gql } from '@apollo/client';
import MemberFields from '../fragments/memberFragment';

export default gql`
  ${MemberFields}
  mutation UpdateMembers($input: UpdateMembersInput!) {
    updateMembers(input: $input) {
      id
      members {
        ...MemberFields
      }
    }
  }
`;
