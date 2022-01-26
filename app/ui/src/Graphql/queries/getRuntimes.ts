import { gql } from '@apollo/client';

export default gql`
  query GetRuntime($id: ID!) {
    runtimes(projectId: $id) {
      id
      name
      desc
      labels
      DockerImage
    }
  }
`;
