import { gql } from '@apollo/client';

export default gql`
  mutation UpdateProject($input: UpdateProjectInput!) {
    updateProject(input: $input) {
      id
      name
      description
      repository {
        error
        url
      }
      archived
    }
  }
`;
