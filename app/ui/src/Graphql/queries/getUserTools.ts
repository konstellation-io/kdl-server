import { gql } from '@apollo/client';

export default gql`
  query GetUserTools($id: ID!) {
    project(id: $id) {
      id
      toolUrls {
        knowledgeGalaxyEnabled
        knowledgeGalaxy
        filebrowser
        mlflow
        minio
      }
    }
    me {
      id
      userTools{
        currentStorageSize
      }
    }
  }
`;
