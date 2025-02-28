import { gql } from '@apollo/client';

export default gql`
  query CreateProjectSettings {
    createProjectSettings {
      mlflowStorageSize
    }
  }
`;
