import { gql } from '@apollo/client';

export default gql`
  query GetCapabilities {
    capabilities {
      id
      name
      default
    }
  }
`;
