import { gql } from '@apollo/client';

export default gql`
  query GetUserTools($id: ID!) {
    project(id: $id) {
      id
      toolUrls {
        knowledgeGalaxy
        gitea
        filebrowser
        vscode
        drone
        mlflow
      }
    }
    me {
      id
    }
  }
`;
