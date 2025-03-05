import { gql } from '@apollo/client';

export default gql`
  mutation Login {
    login {
      id
    }
  }
`;
