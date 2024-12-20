import { gql } from '@apollo/client';

export default gql`
  mutation CreateProject($input: CreateProjectInput!) {
    createProject(input: $input) {
      id
      name
      description
      favorite
      creationDate
      lastActivationDate
      repository {
        url
        error
      }
      needAccess
      archived
      error
    }
  }
`;
