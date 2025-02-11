import { gql } from '@apollo/client';

export default gql`
  query GetRuntimes {
    runtimes {
      id
      name
      desc
      labels
      dockerImage
      dockerTag
      runtimePod
      runtimePodStatus
    }
  }
`;
