import { gql } from '@apollo/client';
import MemberFields from '../fragments/memberFragment';

export default gql`
  ${MemberFields}
  query GetProjects {
    projects {
      id
      name
      description
      favorite
      creationDate
      lastActivationDate
      repository {
        type
        url
        error
      }
      needAccess
      archived
      error
      toolUrls {
        knowledgeGalaxy
        drone
        gitea
        filebrowser
        mlflow
        vscode
      }
      members {
        ...MemberFields
      }
    }
  }
`;
