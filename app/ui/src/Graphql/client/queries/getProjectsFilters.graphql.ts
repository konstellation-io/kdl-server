import { ProjectFilters } from 'Pages/Home/apollo/models/ProjectFilters';
import { gql } from '@apollo/client';

export interface GetProjectFilters {
  projectFilters: ProjectFilters;
}

export const GET_PROJECT_FILTERS = gql`
  {
    projectFilters @client {
      name
      selection
      order
      nFiltered
    }
  }
`;
