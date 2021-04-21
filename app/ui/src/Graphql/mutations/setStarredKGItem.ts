import { gql } from '@apollo/client';

export default gql`
  mutation SetStarredKGItem($input: SetKGStarredInput!) {
    setKGStarred(input: $input) {
      kgItemId
      starred
    }
  }
`;
