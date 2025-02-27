import { gql } from '@apollo/client';

export default gql`
  query CreateProjectSettings {
    createProjectSettings{
      mlflow_storage_size
    }
  }
`;
