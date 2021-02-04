import { RepositoryType } from './../../types/globalTypes';
import { gql } from '@apollo/client';

export interface GetNewProject_newProject_repository_errors {
  type: string;
  slug: string;
}

export interface GetNewProject_newProject_repository_values {
  type: RepositoryType | null;
}

export interface GetNewProject_newProject_repository {
  values: GetNewProject_newProject_repository_values;
  errors: GetNewProject_newProject_repository_errors;
}

export interface GetNewProject_newProject_information_errors {
  name: string;
  description: string;
}

export interface GetNewProject_newProject_information_values {
  name: string;
  description: string;
}

export interface GetNewProject_newProject_externalRepository_values {
  url: string;
  isConnectionTested: boolean;
  hasConnectionError: string;
  warning: boolean;
}

export interface GetNewProject_newProject_externalRepository_errors {
  url: string;
  warning: string;
}

export interface GetNewProject_newProject_internalRepository_values {
  url: string;
  slug: string;
}

export interface GetNewProject_newProject_internalRepository_errors {
  slug: string;
}

export interface GetNewProject_newProject_information {
  values: GetNewProject_newProject_information_values;
  errors: GetNewProject_newProject_information_errors;
}

export interface GetNewProject_newProject_externalRepository {
  values: GetNewProject_newProject_externalRepository_values;
  errors: GetNewProject_newProject_externalRepository_errors;
}

export interface GetNewProject_newProject_internalRepository {
  values: GetNewProject_newProject_internalRepository_values;
  errors: GetNewProject_newProject_internalRepository_errors;
}

export interface GetNewProject_newProject {
  information: GetNewProject_newProject_information;
  repository: GetNewProject_newProject_repository;
  externalRepository: GetNewProject_newProject_externalRepository;
  internalRepository: GetNewProject_newProject_internalRepository;
}

export interface GetNewProject {
  newProject: GetNewProject_newProject;
}

export const GET_NEW_PROJECT = gql`
  {
    newProject @client {
      information {
        values {
          name
          description
        }
        errors {
          name
          description
        }
      }
      repository {
        values {
          type
        }
        errors {
          type
        }
      }
      externalRepository {
        values {
          url
          isConnectionTested
          hasConnectionError
          warning
        }
        errors {
          url
          warning
        }
      }
      internalRepository {
        values {
          url
          slug
        }
        errors {
          slug
        }
      }
    }
  }
`;
