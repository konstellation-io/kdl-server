import { gql } from '@apollo/client';

export default gql`
  query GetRunningCapabilities {
    runningCapability {
      id
      name
      default
    }
  }
`;
