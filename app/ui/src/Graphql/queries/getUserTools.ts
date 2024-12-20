import { gql } from '@apollo/client';

export default gql`
  query GetUserTools($id: ID!) {
    project(id: $id) {
      id
      toolUrls {
        knowledgeGalaxy
        filebrowser
        vscode
        mlflow
      }
    }
    me {
      id
    }
  }
`;
