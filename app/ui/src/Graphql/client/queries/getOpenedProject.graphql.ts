import { GetProjects_projects } from 'Graphql/queries/types/GetProjects';
import { gql } from '@apollo/client';

export interface GetOpenedProject {
  openedProject: GetProjects_projects;
}

export const GET_OPENED_PROJECT = gql`
  {
    openedProject @client {
      id
      name
      description
      favorite
      creationDate
      lastActivationDate
      repository {
        id
        type
        url
        connected
      }
      state
      error
    }
  }
`;
