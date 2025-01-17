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
        url
        error
      }
      needAccess
      archived
      error
      toolUrls {
        knowledgeGalaxy
        filebrowser
        mlflow
      }
      members {
        ...MemberFields
      }
    }
  }
`;
