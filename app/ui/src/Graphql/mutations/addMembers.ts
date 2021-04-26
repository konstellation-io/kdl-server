import { gql } from '@apollo/client';
import MemberFields from '../fragments/memberFragment';

export default gql`
  ${MemberFields}
  mutation AddMembers($input: AddMembersInput!) {
    addMembers(input: $input) {
      id
      members {
        ...MemberFields
      }
    }
  }
`;
